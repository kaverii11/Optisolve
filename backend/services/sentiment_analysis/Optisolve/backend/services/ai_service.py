from typing import Dict, Union

from backend.utils.fake_ai_generator import generic_reply, password_reply, vpn_reply


def analyze_ticket(text: str) -> Dict[str, Union[float, str]]:
    normalized_text = text.lower()

    if "vpn" in normalized_text:
        return {
            "confidence": 0.9,
            "draft_reply": vpn_reply(),
        }

    if "password" in normalized_text:
        return {
            "confidence": 0.75,
            "draft_reply": password_reply(),
        }

    return {
        "confidence": 0.4,
        "draft_reply": generic_reply(),
    }
