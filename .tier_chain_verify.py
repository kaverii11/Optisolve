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


def evaluate(query: str, username: str) -> dict:
    cid = start_conversation(username)
    result = post_user_message(cid, query)
    return {
        "conversation_id": cid,
        "query": query,
        "tier": result.get("tier"),
        "confidence": result.get("confidence"),
        "content_preview": (result.get("content") or "")[:120],
    }


def train_conversation(query: str, followup: str, reply1: str, reply2: str, username: str) -> dict:
    cid = start_conversation(username)
    first = post_user_message(cid, query)

    trained = False
    if first.get("tier") in ["tier2", "tier3"]:
        post_agent_reply(cid, reply1)
        post_user_message(cid, followup)
        post_agent_reply(cid, reply2)
        resolve_conversation(cid)
        trained = True

    return {
        "conversation_id": cid,
        "initial_tier": first.get("tier"),
        "initial_confidence": first.get("confidence"),
        "trained": trained,
    }


def main():
    # Fresh topic to reduce contamination from prior tests
    base_issue = "Our Kubernetes deployment enters CrashLoopBackOff because readiness and liveness probes fail during startup."
    followup_1 = "It usually happens after new releases when app cold start is slower than normal."
    followup_2 = "Pods restart before migrations and cache warmup complete."

    agent_reply_1 = "Increase initialDelaySeconds and failureThreshold, and separate readiness from liveness so startup latency doesn't trigger restarts."
    agent_reply_2 = "Use startupProbe, tune periodSeconds/timeoutSeconds, and ensure app exposes health endpoints only after dependencies initialize."

    variants_for_tier2_search = [
        "K8s pods restart because health probes fail while app is still booting.",
        "Readiness/liveness checks are too strict and pods keep restarting on deploy.",
        "CrashLoopBackOff due to probe failures during slow startup in Kubernetes.",
        "Service starts slowly and liveness probe kills pod early.",
    ]

    final_tier1_query = "Kubernetes CrashLoopBackOff from liveness probe failures during startup - how should I configure probes?"

    output = {}

    # Step A: Baseline should be Tier3 or Tier2 before training
    baseline = evaluate(base_issue, "chain_baseline")
    output["baseline"] = baseline

    # Step B: First training with additional messages
    train1 = train_conversation(base_issue, followup_1, agent_reply_1, agent_reply_2, "chain_trainer_1")
    output["train_1"] = train1
    time.sleep(2)

    # Step C: Find a Tier2 phrasing after first training
    tier2_candidate = None
    searched = []
    for idx, query in enumerate(variants_for_tier2_search, start=1):
        res = evaluate(query, f"chain_mid_eval_{idx}")
        searched.append(res)
        if res.get("tier") == "tier2" and tier2_candidate is None:
            tier2_candidate = res
    output["mid_search"] = searched
    output["tier2_candidate"] = tier2_candidate

    # Step D: Train again using the discovered Tier2 candidate (if found)
    train2 = None
    if tier2_candidate:
        train2 = train_conversation(
            tier2_candidate["query"],
            followup_2,
            "Use startupProbe and relax liveness until the app is ready.",
            "Add probe grace periods and verify endpoint behavior under cold starts.",
            "chain_trainer_2",
        )
        time.sleep(2)
    output["train_2"] = train2

    # Step E: Evaluate final close query expected to reach Tier1
    final_eval = evaluate(final_tier1_query, "chain_final_eval")
    output["final_eval"] = final_eval

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
