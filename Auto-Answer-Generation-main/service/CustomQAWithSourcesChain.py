from langchain.chains.qa_with_sources.base import BaseQAWithSourcesChain
from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from typing import Any, Dict, List
from langchain.docstore.document import Document

from langchain.callbacks.manager import (
    AsyncCallbackManagerForChainRun,
    CallbackManagerForChainRun,
)

# token limit 을 해결하기 위해, 기본 QA LangChain 커스터마이징
class CustomQAWithSourcesChain(BaseQAWithSourcesChain):

    reduce_k_below_max_tokens: bool = False
    max_tokens_limit: int = 3375

    documents = list()

    def update_docs(self, docs):
      self.documents = docs

    def _reduce_tokens_below_limit(self, docs: List[Document]) -> List[Document]:
        num_docs = len(docs)

        if self.reduce_k_below_max_tokens and isinstance(
            self.combine_documents_chain, StuffDocumentsChain
        ):
            tokens = [
                self.combine_documents_chain.llm_chain.llm.get_num_tokens(
                    doc.page_content
                )
                for doc in docs
            ]
            token_count = sum(tokens[:num_docs])
            while token_count > self.max_tokens_limit:
                num_docs -= 1
                token_count -= tokens[num_docs]

        return docs[:num_docs]

    def _get_docs(
        self, inputs: Dict[str, Any], *, run_manager: CallbackManagerForChainRun
    ) -> List[Document]:
        docs = self.documents
        return self._reduce_tokens_below_limit(docs)

    async def _aget_docs(
        self, inputs: Dict[str, Any], *, run_manager: AsyncCallbackManagerForChainRun
    ) -> List[Document]:
        docs = await self.documents
        return self._reduce_tokens_below_limit(docs)