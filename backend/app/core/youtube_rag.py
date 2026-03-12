import os
import re
import time
import logging
from typing import List, Dict, Optional, Tuple

from youtube_transcript_api import YouTubeTranscriptApi
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter 
from langchain_pinecone import PineconeVectorStore
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from pinecone import Pinecone as PineconeClient, ServerlessSpec
from rank_bm25 import BM25Okapi
import numpy as np

from app.config import settings

logger = logging.getLogger(__name__)


class YouTubeRAG:
    """Production-ready YouTube RAG system"""

    PINECONE_INDEX_NAME = "youtube-rag"
    PINECONE_DIMENSION = 1536
    PINECONE_METRIC = "cosine"

    def __init__(
        self,
        user_id: str,
        model: str = "gpt-4o-mini",
        temperature: float = 0.5,
    ):
        self.user_id = user_id
        self.llm = ChatOpenAI(
            model=model,
            temperature=temperature,
            api_key=settings.OPENAI_API_KEY,
        )
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=settings.OPENAI_API_KEY,
        )
        self.parser = StrOutputParser()

        # Initialize Pinecone
        self.pc = PineconeClient(api_key=settings.PINECONE_API_KEY)
        self._ensure_pinecone_index()

        # Build chains
        self.build_chains()

    def _ensure_pinecone_index(self):
        """Create Pinecone index if it doesn't exist"""
        existing_indexes = [idx.name for idx in self.pc.list_indexes()]
        if self.PINECONE_INDEX_NAME not in existing_indexes:
            logger.info(f"Creating Pinecone index: {self.PINECONE_INDEX_NAME}")
            self.pc.create_index(
                name=self.PINECONE_INDEX_NAME,
                dimension=self.PINECONE_DIMENSION,
                metric=self.PINECONE_METRIC,
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )
            # Wait for index to be ready
            time.sleep(5)

    @staticmethod
    def extract_video_id(url: str) -> Optional[str]:
        """Extract YouTube video ID from various URL formats"""
        patterns = [
            r"(?:v=|\/)([0-9A-Za-z_-]{11}).*",
            r"(?:embed\/)([0-9A-Za-z_-]{11})",
            r"(?:watch\?v=)([0-9A-Za-z_-]{11})",
            r"(?:youtu\.be\/)([0-9A-Za-z_-]{11})",
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    def get_transcript(self, video_id: str, languages: List[str] = None) -> str:
        """Extract transcript from YouTube video"""
        if languages is None:
            languages = ["en", "hi"]
        try:
            ytt_api = YouTubeTranscriptApi()
            fetched = ytt_api.fetch(video_id, languages=languages)
            transcript = " ".join([snippet.text for snippet in fetched.snippets])
            logger.info(f"Transcript extracted for video {video_id}: {len(transcript)} chars")
            return transcript
        except Exception as e:
            logger.error(f"Error extracting transcript for {video_id}: {e}")
            raise ValueError(f"Could not extract transcript: {str(e)}")

    def create_documents(
        self, transcript: str, video_id: str, chunk_size: int = 1000, chunk_overlap: int = 200
    ) -> List[Document]:
        """Split transcript into chunks and create documents"""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        chunks = splitter.split_text(transcript)

        documents = []
        for i, chunk in enumerate(chunks):
            doc = Document(
                page_content=chunk,
                metadata={
                    "video_id": video_id,
                    "user_id": str(self.user_id),
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                },
            )
            documents.append(doc)

        logger.info(f"Created {len(documents)} document chunks for video {video_id}")
        return documents

    def store_embeddings(self, documents: List[Document], video_id: str) -> PineconeVectorStore:
        """Store document embeddings in Pinecone"""
        namespace = f"user_{self.user_id}_{video_id}"
        vector_store = PineconeVectorStore.from_documents(
            documents=documents,
            embedding=self.embeddings,
            index_name=self.PINECONE_INDEX_NAME,
            namespace=namespace,
        )
        logger.info(f"Stored {len(documents)} embeddings in namespace {namespace}")
        return vector_store

    def get_vector_store(self, video_id: str) -> PineconeVectorStore:
        """Get existing vector store for a video"""
        namespace = f"user_{self.user_id}_{video_id}"
        return PineconeVectorStore(
            index_name=self.PINECONE_INDEX_NAME,
            embedding=self.embeddings,
            namespace=namespace,
        )

    def hybrid_search(self, query: str, documents: List[Document], video_id: str, k: int = 5) -> List[Document]:
        """Perform hybrid search using both BM25 and vector similarity"""
        # Vector search
        vector_store = self.get_vector_store(video_id)
        vector_results = vector_store.similarity_search(query, k=k)

        # BM25 search
        tokenized_docs = [doc.page_content.lower().split() for doc in documents]
        bm25 = BM25Okapi(tokenized_docs)
        bm25_scores = bm25.get_scores(query.lower().split())
        top_bm25_indices = np.argsort(bm25_scores)[-k:][::-1]
        bm25_results = [documents[i] for i in top_bm25_indices if bm25_scores[i] > 0]

        # Merge results (remove duplicates)
        seen = set()
        merged = []
        for doc in vector_results + bm25_results:
            content = doc.page_content
            if content not in seen:
                seen.add(content)
                merged.append(doc)
        return merged[:k]

    def build_chains(self):
        """Build LangChain chains for QA and summarization"""
        # QA chain
        qa_prompt = ChatPromptTemplate.from_template(
            """You are a helpful AI assistant that answers questions about YouTube videos.
Use the following context from the video transcript to answer the question.
If you don't know the answer based on the context, say so honestly.

Context:
{context}

Question: {question}

Answer:"""
        )
        self.qa_chain = qa_prompt | self.llm | self.parser

        # Summary chain
        summary_prompt = ChatPromptTemplate.from_template(
            """You are a helpful AI assistant. Provide a comprehensive summary of the following 
YouTube video transcript. Include the main topics, key points, and important details.

Transcript:
{transcript}

Summary:"""
        )
        self.summary_chain = summary_prompt | self.llm | self.parser

        # Conversational chain (with memory)
        conv_prompt = ChatPromptTemplate.from_template(
            """You are a helpful AI assistant having a conversation about a YouTube video.
Use the context from the video transcript and the conversation history to answer.

Context from video:
{context}

Conversation history:
{history}

Current question: {question}

Answer:"""
        )
        self.conv_chain = conv_prompt | self.llm | self.parser

    def ask(self, question: str, video_id: str, documents: List[Document] = None) -> Tuple[str, List[str]]:
        """Ask a question about a video"""
        vector_store = self.get_vector_store(video_id)
        relevant_docs = vector_store.similarity_search(question, k=4)

        if not relevant_docs:
            return "I couldn't find relevant information in the video transcript.", []

        context = "\n\n".join([doc.page_content for doc in relevant_docs])
        context_list = [doc.page_content for doc in relevant_docs]

        answer = self.qa_chain.invoke({"context": context, "question": question})
        return answer, context_list

    def ask_with_memory(
        self, question: str, video_id: str, history: List[Dict[str, str]]
    ) -> Tuple[str, List[str]]:
        """Ask a question with conversation history"""
        vector_store = self.get_vector_store(video_id)
        relevant_docs = vector_store.similarity_search(question, k=4)

        context = "\n\n".join([doc.page_content for doc in relevant_docs])
        context_list = [doc.page_content for doc in relevant_docs]

        # Format history
        history_str = ""
        for msg in history[-5:]:  # Keep last 5 exchanges
            history_str += f"User: {msg['question']}\nAssistant: {msg['answer']}\n\n"

        answer = self.conv_chain.invoke(
            {"context": context, "history": history_str, "question": question}
        )
        return answer, context_list

    def summarize(self, video_id: str, transcript: str) -> str:
        """Generate a summary of the video"""
        # Truncate transcript if too long
        max_chars = 10000
        truncated = transcript[:max_chars] if len(transcript) > max_chars else transcript
        summary = self.summary_chain.invoke({"transcript": truncated})
        return summary

    def process_video(
        self, video_url: str, chunk_size: int = 1000, chunk_overlap: int = 200
    ) -> Dict:
        """Full pipeline: extract transcript, chunk, embed, store"""
        video_id = self.extract_video_id(video_url)
        if not video_id:
            raise ValueError("Invalid YouTube URL")

        transcript = self.get_transcript(video_id)
        documents = self.create_documents(transcript, video_id, chunk_size, chunk_overlap)
        self.store_embeddings(documents, video_id)

        return {
            "video_id": video_id,
            "transcript_length": len(transcript),
            "num_chunks": len(documents),
        }

    def delete_video_embeddings(self, video_id: str):
        """Delete all embeddings for a video"""
        namespace = f"user_{self.user_id}_{video_id}"
        index = self.pc.Index(self.PINECONE_INDEX_NAME)
        try:
            index.delete(delete_all=True, namespace=namespace)
            logger.info(f"Deleted embeddings for namespace {namespace}")
        except Exception as e:
            logger.warning(f"Error deleting embeddings: {e}")
