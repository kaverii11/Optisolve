#!/usr/bin/env python3
import json
import time
import requests

BASE_URL = "http://localhost:9000"


def start_conv(username):
    return requests.post(f"{BASE_URL}/conversation/start", json={"username": username}, timeout=30).json()["conversation_id"]


def send_msg(cid, content):
    r = requests.post(f"{BASE_URL}/conversation/{cid}/message", json={"content": content}, timeout=60)
    r.raise_for_status()
    return r.json()


def agent_reply(cid, content):
    r = requests.post(f"{BASE_URL}/agent/conversation/{cid}/reply", json={"content": content}, timeout=30)
    r.raise_for_status()


def resolve(cid):
    r = requests.post(f"{BASE_URL}/agent/conversation/{cid}/resolve", timeout=30)
    r.raise_for_status()


def train(issue, followup, reply1, reply2):
    cid = start_conv("hunt_trainer")
    first = send_msg(cid, issue)
    if first.get("tier") in ["tier2", "tier3"]:
        agent_reply(cid, reply1)
        send_msg(cid, followup)
        agent_reply(cid, reply2)
        resolve(cid)
        return {"trained": True, "tier": first.get("tier"), "confidence": first.get("confidence"), "cid": cid}
    return {"trained": False, "tier": first.get("tier"), "confidence": first.get("confidence"), "cid": cid}


def evaluate_many(queries):
    out = []
    for i, q in enumerate(queries, start=1):
        cid = start_conv(f"hunt_eval_{i}")
        res = send_msg(cid, q)
        out.append({"query": q, "tier": res.get("tier"), "confidence": res.get("confidence")})
    return out


if __name__ == "__main__":
    seed_issue = "My Django app shows random database lock timeouts during traffic spikes and requests fail."
    followup = "It happens more when many users update records at the same time."
    reply1 = "Tune DB transaction isolation, shorten transactions, and add retry on deadlock/lock timeout errors."
    reply2 = "Add query indexes, avoid long-running write transactions, and use queueing for burst writes."

    baseline = evaluate_many([seed_issue])[0]
    training = train(seed_issue, followup, reply1, reply2)
    time.sleep(2)

    variants = [
        "Django gets random DB lock timeout errors under load.",
        "Under traffic spikes, Django requests fail with database lock timeout.",
        "How can I fix occasional database lock wait timeout in Django?",
        "Django concurrency causes intermittent transaction lock timeout failures.",
        "My web app is timing out due to database locks when many users submit forms.",
        "Database lock wait timeout in production during peak usage.",
        "We see lock timeout and deadlock-like behavior in Django during heavy writes.",
    ]
    after = evaluate_many(variants)

    print(json.dumps({"baseline": baseline, "training": training, "after": after}, indent=2))
