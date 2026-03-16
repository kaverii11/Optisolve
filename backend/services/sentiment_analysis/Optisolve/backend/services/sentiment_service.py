NEGATIVE_SIGNAL_WORDS = {"angry", "urgent", "frustrated"}


def sentiment_score(text: str) -> float:
    normalized_text = text.lower()
    score = 0.0

    for word in NEGATIVE_SIGNAL_WORDS:
        if word in normalized_text:
            score -= 0.35

    return max(-1.0, min(1.0, score))
