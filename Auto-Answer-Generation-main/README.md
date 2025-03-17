# Fast API 웹 서버
- 질문 채팅에 대해서 답변 생성 역할을 수행하는 Back-End 서비스 입니다. 
- 추가로, 관리자가 전송한 (질문, 답변) 쌍을 라이브 커머스 시청자(Chrome Extension)에 전달하는 역할도 수행합니다.

# 1. LangChain as RAG

- RAG (Retrieval-Augmented Generation)란?
    - 기초 모델의 외부에서 데이터를 검색하여, 조회된 데이터를 LLM의 문맥으로 사용하는 방법
- LangChain 이란? → [LangChain](https://www.langchain.com/langchain)
    - LLM(Large Language Model)에서 구동되는 App → RAG를 개발하기 위한 프레임워크
    - 이를 사용하여 챗봇, 생성적 질문-답변(GQA), 요약 등의 Application 을 생성할 수 있음

    ![image](https://github.com/user-attachments/assets/5c3f46f3-731a-458f-8e55-4a5541bc8430)

# 2. LangChain 구축

- LangChain 구성 요소
    - input document
        - 애플리케이션이 LLM에 대한 컨텍스트를 구축하기 위한 Text, PDF, CSV 형태의 외부 데이터
    - embedding
        - 외부 데이터 및 사용자의 질문을 벡터로 변환하기 위한 embedding 모델
    - vector store
        - 외부 데이터의 embedding 값에 대하여 추후 유사성 검사를 위해 vector store 에 저장
    - 참조 문서 개수 (k)
        - LLM 이 Answer를 생성하기 위해 참조할 수 있는 vector store 에서 선택한 input document 의 개수
    - prompt template
        - prompt template 에서는 LLM 에 전달하는 지시사항 관리
    - LLM (Large Language Model)
        - 선택한 input document 를 기반으로 prompt template 에 맞춰서 Question 에 대한 Answer 생성
- input document
    - 라이브 커머스 방송 관리자가 실시간으로 답변한 (질문 - 답변) 쌍
    - 라이브 커머스 방송 정보 (이벤트, 방송 시간)
    - 라이브 커머스 방송에서 판매하는 상품들의 상세 정보
    - 라이브 커머스 방송에서 판매하는 상품들의 Question & Answer
- embedding
    - Open AI embedding, Sentence BERT 모델 고려
- vector store
    - Chroma db, FAISS db 고려
    - 방송 진행 중, 방송 관리자의 실시간 답변 내용에 대한 정보 업데이트 기능
- 참조 문서 개수 (k)
    - 참조 문서 개수 3, 4, 5 개 고려
- LLM (Large Language Model)
    - Open AI 의 GPT 3.5-turbo, GPT 4.0 모델 고려

- LangChain 구축
    - RAG 파이프라인 성능 평가를 통한 파라미터 선택
        - embedding, vector store, 참조 문서 개수 (k), LLM 의 다양한 설정을 통해 실험 수행
    - prompt template
        - LLM 의 역할, 입력 데이터, 수행할 Task, 답변 형식을 기반으로 prompt template 작성

![image](https://github.com/user-attachments/assets/f3b481c7-f5f1-49e0-8e14-43c5fac1a6cc)

# **3. RAG 파이프라인 성능 평가 With RAGAS**

- 기존 RAG 파이프라인 성능 평가 방법
    - BLUE : 정답문장과 생성문장의 겹치는 단어 수 / 생성문장의 전체 단어 수
    - ROUGE : 정답문장과 생성문장의 겹치는 단어 수 / 정답문장의 전체 단어 수
- 기존 RAG 파이프라인 성능 평가 방법의 한계점
    - 인간 평가와의 낮은 상관관계
    - 점수 해석의 어려움
    - 평가 지표의 편향성
- LLM assisted evaluation
    - Strong LLM 을 RAG 파이프라인의 응답을 평가하기 위해 사용함
    - RAGAS, G-Eval, GPT-Score 와 같은 프레임워크 존재
- RAGAS (RAG Assessment)
    - LLM assisted evaluation 프레임워크 중 인간 평가와 가장 높은 상관관계를 보임
    - Faithfulness, Context Relevancy, Answer Relevancy 와 같은 지표들을 기준으로 평가 수행

# 4. RAG 평가 수행

- RAGAS (RAG Assessment) 평가 지표
    - Faithfulness : 참조 문서에 대한 생성된 답변의 정보 일관성을 측정
    - Context Relevancy : 선택한 참조 문서와 질문의 관련성을 측정
    - Answer Relevancy : 생성된 답변이 질문이나 참조 문서의 정보를 근거로 작성되었는지 판단
    - 최종 RAGAS Score : 극단적인 값에 패널티를 부여하기 위해, 각 metric score 의 조화 평균 사용
## 파라미터 선택 및 (LangChain, LLM 모델) 비교
![image](https://github.com/user-attachments/assets/ebfa35fd-d41e-4096-8409-2a87014b917c)

# 5. LangChain Application 배포
![image](https://github.com/user-attachments/assets/3012ac75-ad7a-43af-9678-8b6355c742d3)
