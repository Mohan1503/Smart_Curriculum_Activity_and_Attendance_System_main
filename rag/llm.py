import os
from typing import Optional

from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage


class GroqLLM:
    """LLM interface using Groq API."""

    def __init__(
        self,
        model_name: str = "llama-3.1-8b-instant",
        api_key: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: int = 1024,
    ):
        self.model_name = model_name
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")

        if not self.api_key:
            raise ValueError(
                "Groq API key required. Set GROQ_API_KEY environment variable or pass api_key parameter."
            )

        self.llm = ChatGroq(
            groq_api_key=self.api_key,
            model_name=self.model_name,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        print(f"Initialized Groq LLM with model: {self.model_name}")

    def generate(self, query: str, context: str) -> str:
        """Generate response using retrieved context."""
        prompt_template = PromptTemplate(
            input_variables=["context", "question"],
            template="""You are a helpful AI assistant. Use the following context to answer the question accurately and concisely.

Context:
{context}

Question: {question}

Answer: Provide a clear and informative answer based on the context above. If the context doesn't contain enough information, say so.""",
        )

        formatted_prompt = prompt_template.format(context=context, question=query)

        try:
            messages = [HumanMessage(content=formatted_prompt)]
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            return f"Error generating response: {str(e)}"

    def generate_simple(self, query: str, context: str) -> str:
        """Simple response generation without complex prompting."""
        simple_prompt = f"""Based on this context: {context}

Question: {query}

Answer:"""

        try:
            messages = [HumanMessage(content=simple_prompt)]
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            return f"Error: {str(e)}"
