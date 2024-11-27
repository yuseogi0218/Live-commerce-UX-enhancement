from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma

from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)

from langchain.chat_models import ChatOpenAI

from dotenv import load_dotenv
import os

import urllib.request, json

# Open AI GPT API Key
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

class QAService:
    def __init__(self):

        # 임베딩 모델 - OpenAI 임베딩
        embeddings = OpenAIEmbeddings()

        # Langchain Vector Store - LLM이 답변 생성 시, 참고할 문서 데이터베이스
        self.vector_store = Chroma(embedding_function=embeddings)

        # Langchain 템플릿 - LLM에게 전달할 내용
        system_template = """You are a host of a live shopping broadcast. You will be provided with ("SOURCES") and questions.
        When a Korean question sentence is entered as an input, please refer to the "SOURCES" and answer it.
        Please write your answer in a sentence. Please do not include greetings such as "안녕하세요", "안녕하세요 고객님" or “감사합니다” in your answer.
        If you don't know the answer, just say that "답변을 생성할 수 없습니다.", don't try to make up an answer.

        ----------------
        {summaries}

        You MUST answer in Korean with single sentence."""

        # LLM 에게 템플릿과 질문을 같이 전달함
        messages = [
            SystemMessagePromptTemplate.from_template(system_template),
            HumanMessagePromptTemplate.from_template("{question}")
        ]

        prompt = ChatPromptTemplate.from_messages(messages)

        chain_type_kwargs = {"prompt": prompt}

        # GPT-3.5-turbo 모델의 LLM 사용
        llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)

        # 
        self.chain = CustomQAWithSourcesChain.from_chain_type(
            llm=llm,
            chain_type="stuff",
            return_source_documents=True,
            chain_type_kwargs=chain_type_kwargs
        )

    # 상세 정보 저장
    def add_info(self, broadcast_id, information):
        # 방송 상세 정보 저장
        broadcast_info_list = information.broadcast
        broadcast_texts = list()
        broadcast_metadatas = list()
        for broadcast_info in broadcast_info_list:
            for broadcast_text in broadcast_info.texts:
                broadcast_texts.append(broadcast_info.type + '\n' + broadcast_text)
                broadcast_metadatas.append({'broadcast_id': broadcast_id, 'source': 'broadcast'})
        self.vector_store.add_texts(texts=broadcast_texts, metadatas=broadcast_metadatas)

        # 상품 상세 정보 저장
        product_info_list = information.product
        product_texts = list()
        product_metadatas = list()
        for product_info in product_info_list:
            for product_text in product_info.texts:
                product_texts.append(product_info.name + '\n' + product_text)
                product_metadatas.append({'broadcast_id': broadcast_id, 'source': 'product'})
        self.vector_store.add_texts(texts=product_texts, metadatas=product_metadatas)

        # 질의 응답 (QA) 데이터 셋 로드
        self.add_qa_info(broadcast_id, product_info_list)

    # 관리자가 전송한 질문, 답변 쌍 저장
    def add_admin_answer_info(self, broadcast_id, question, answer):
        metadata = {'answer': answer, 'broadcast_id': broadcast_id, 'source': 'admin_qa'}

        self.vector_store.add_texts(texts=[question], metadatas=[metadata])

    # 방송 상품 상세 정보에 있는 질문-답변 쌍 정보 저장
    def add_qa_info(self, broadcast_id, product_info_list):
        qa_texts = list()
        qa_metadatas = list()

        for product_info in product_info_list:
            product_id = product_info.id
            product_name = product_info.name
            qa_list_url = f'https://shopping.naver.com/shopv/v1/comments/PRODUCTINQUIRY/{product_id}'

            with urllib.request.urlopen(qa_list_url) as url:
                data = json.loads(url.read().decode())
                qa_size = data['totalElements']

            if qa_size > 0:
                qa_list_url_size = f'https://shopping.naver.com/shopv/v1/comments/PRODUCTINQUIRY/{product_id}?size={qa_size}&sellerAnswerYn=true'
                with urllib.request.urlopen(qa_list_url_size) as url:
                    data = json.loads(url.read().decode())

                    if data['totalElements'] > 0:
                        for content in data['contents']:
                            if not content['secretYn']:
                                qa_id = content['id']
                                qa_detail_url = f'https://shopping.naver.com/shopv/v1/comments/replies/{qa_id}'
                                with urllib.request.urlopen(qa_detail_url) as qa_url:
                                    qa_detail = json.loads(qa_url.read().decode())
                                    question = content['commentContent']
                                    answer = qa_detail[0]['commentContent']

                                    qa_texts.append(product_name + '\n' + question)
                                    qa_metadatas.append({'answer': answer, 'broadcast_id': broadcast_id, 'source': 'qa'})

        if len(qa_texts) > 0:
            self.vector_store.add_texts(texts=qa_texts, metadatas=qa_metadatas)


    # 문서 선택
    def select_documents(self, broadcast_id, query):

        res_docs = []

        # 문서와 질문의 유사도를 기준으로 상위 3개의 문서 선택
        result = self.vector_store.similarity_search_with_score(query, k=self.vector_store._collection.count(), filter={"broadcast_id":broadcast_id})[:3]

        # 각 문서의 타입에 맞춰서 데이터 변형
        for doc, score in result:
            if doc.metadata['source'] == 'qa' or doc.metadata['source'] == 'admin_qa':
                doc.page_content = "Question:" + doc.page_content + "\nAnswer:" + doc.metadata['answer']
                doc.metadata['score'] = score
            else:
                doc.metadata['score'] = score
            res_docs.append(doc)

        return res_docs

    # 답변 생성
    def get_answer(self, broadcast_id, query):
        result = dict()
        result['query'] = query
        docs = self.select_documents(broadcast_id, query)

        self.chain.update_docs(docs)
        answer = self.chain(query)
        result['answer'] = answer['answer']
        return result