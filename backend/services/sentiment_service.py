import json
import logging
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
logger = logging.getLogger(__name__)
client = OpenAI(
    api_key=os.getenv("SAMBANOVA_API_KEY"),
    base_url="https://api.sambanova.ai/v1"
)


class SentimentService:
    """
    Uses SambaNova API for context-aware sentiment analysis.
    """

    def analyze(self, text: str):
        """
        Sends text to SambaNova API for sentiment.
        Returns: {"score": -1..1, "sentiment": label}
        """

        if not text or not text.strip():
            return {"score": 0.0, "sentiment": "neutral"}

        # Create prompt
        prompt = f"""
You are a sentiment analysis assistant.
Analyze the sentiment of the following text.

Respond **only** in JSON format with no extra text or markdown:
{{
  "sentiment": "<very_negative|negative|neutral|positive|very_positive>",
  "score": <float between -1 and 1>
}}

Text: "{text}"
"""

        try:
            response = client.chat.completions.create(
                model="Meta-Llama-3.1-8B-Instruct",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            )

            content = response.choices[0].message.content.strip()

            # Strip markdown code fences if present
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]

            return json.loads(content)

        except Exception as e:
            logger.warning("SambaNova sentiment call failed: %s", e)
            return {"sentiment": "neutral", "score": 0.0}


# Singleton instance
sentiment_engine = SentimentService()
