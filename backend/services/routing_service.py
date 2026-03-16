def routing_logic(confidence: float, sentiment: float) -> tuple[str, float]:
    adjusted_confidence = confidence

    if sentiment <= -0.7:
        adjusted_confidence -= 0.2

    adjusted_confidence = max(0.0, min(1.0, adjusted_confidence))

    if adjusted_confidence > 0.85:
        return "tier1", adjusted_confidence

    if 0.6 <= adjusted_confidence <= 0.85:
        return "tier2", adjusted_confidence

    return "tier3", adjusted_confidence
