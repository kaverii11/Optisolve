import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(
    api_key=os.getenv("SAMBANOVA_API_KEY"),
    base_url="https://api.sambanova.ai/v1"
)


class SentimentService:
    """
    Uses SambaNova API for context-aware sentiment analysis.
    """

    def __init__(self):
        # Optional: custom domain-specific words to boost
        self.custom_lexicon = {}

    def update_word_weight(self, word, weight):
        """
        Add or update a word/phrase with custom weight (for boosting).
        """
        self.custom_lexicon[word.lower()] = weight

    def analyze(self, text: str):
        """
        Sends text to SambaNova API for sentiment.
        Returns: {"score": -1..1, "sentiment": label}
        """

        if not text or not text.strip():
            return {"score": 0.0, "sentiment": "neutral"}

        # Apply custom lexicon amplification
        for word, weight in self.custom_lexicon.items():
            if word in text.lower():
                text += " " + ("very " * int(abs(weight)))

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
            print("SambaNova API Error:", e)
            return {"sentiment": "neutral", "score": 0.0}


# Singleton instance
sentiment_engine = SentimentService()
