#!/usr/bin/env python3
import json
import time
import requests

BASE_URL = "http://localhost:9000"


def start_conversation(username: str) -> str:
    response = requests.post(f"{BASE_URL}/conversation/start", json={"username": username}, timeout=30)
    response.raise_for_status()
    return response.json()["conversation_id"]


def post_user_message(conversation_id: str, content: str) -> dict:
    response = requests.post(
        f"{BASE_URL}/conversation/{conversation_id}/message",
        json={"content": content},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def post_agent_reply(conversation_id: str, content: str) -> None:
    response = requests.post(
        f"{BASE_URL}/agent/conversation/{conversation_id}/reply",
        json={"content": content},
        timeout=30,
    )
    response.raise_for_status()


def resolve_conversation(conversation_id: str) -> None:
    response = requests.post(f"{BASE_URL}/agent/conversation/{conversation_id}/resolve", timeout=30)
    response.raise_for_status()


def train_on_issue(base_issue: str, followup_issue: str, agent_reply_primary: str, agent_reply_followup: str, username: str) -> dict:
    cid = start_conversation(username)

    first = post_user_message(cid, base_issue)
    first_tier = first.get("tier")
    first_conf = first.get("confidence")

    trained = False
    if first_tier in ["tier2", "tier3"]:
        post_agent_reply(cid, agent_reply_primary)

        # Additional message to enrich memory (summary gate + extra turn chunk)
        post_user_message(cid, followup_issue)
        post_agent_reply(cid, agent_reply_followup)

        resolve_conversation(cid)
        trained = True

    return {
        "conversation_id": cid,
        "tier": first_tier,
        "confidence": first_conf,
        "trained": trained,
    }


def evaluate_issue(issue_text: str, username: str) -> dict:
    cid = start_conversation(username)
    result = post_user_message(cid, issue_text)
    return {
        "conversation_id": cid,
        "tier": result.get("tier"),
        "confidence": result.get("confidence"),
        "reply_preview": (result.get("content") or "")[:140],
    }


def run_case(case_name: str, seed_issue: str, eval_issue: str, followup_issue: str, agent_reply_primary: str, agent_reply_followup: str):
    baseline = evaluate_issue(seed_issue, f"{case_name}_baseline")

    train = train_on_issue(
        base_issue=seed_issue,
        followup_issue=followup_issue,
        agent_reply_primary=agent_reply_primary,
        agent_reply_followup=agent_reply_followup,
        username=f"{case_name}_trainer",
    )

    # allow vector writes to settle
    time.sleep(2)

    after = evaluate_issue(eval_issue, f"{case_name}_after")

    return {
        "case": case_name,
        "baseline": baseline,
        "train": train,
        "after": after,
    }


def main():
    cases = [
        {
            "case_name": "tier3_to_tier2_candidate",
            "seed_issue": "My Node.js service gets ECONNREFUSED when connecting to Redis and I can't tell why.",
            "eval_issue": "Node app is getting ECONNREFUSED to Redis. How should I troubleshoot this?",
            "followup_issue": "I also see occasional timeout spikes during reconnect attempts.",
            "agent_reply_primary": "Check Redis host/port, verify container/network reachability, and add retry with exponential backoff. Also validate AUTH and TLS settings.",
            "agent_reply_followup": "Set connectTimeout and socket keepalive, monitor reconnection events, and cap retry storms to avoid cascading failures.",
        },
        {
            "case_name": "tier2_to_tier1_candidate",
            "seed_issue": "Nginx returns intermittent 502 when upstream app response is slow under load.",
            "eval_issue": "Intermittent Nginx 502 from slow upstream under load. What config should I tune?",
            "followup_issue": "We also noticed upstream keepalive resets during peak traffic.",
            "agent_reply_primary": "Increase proxy_read_timeout, tune upstream keepalive, and inspect app latency with request tracing.",
            "agent_reply_followup": "Tune worker_connections, set sensible keepalive_requests, and align upstream/app timeouts to prevent premature 502 errors.",
        },
    ]

    outputs = []
    for case in cases:
        outputs.append(
            run_case(
                case_name=case["case_name"],
                seed_issue=case["seed_issue"],
                eval_issue=case["eval_issue"],
                followup_issue=case["followup_issue"],
                agent_reply_primary=case["agent_reply_primary"],
                agent_reply_followup=case["agent_reply_followup"],
            )
        )

    print(json.dumps(outputs, indent=2))


if __name__ == "__main__":
    main()
