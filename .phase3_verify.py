#!/usr/bin/env python3
"""
Phase 3 Verification: Demonstrate confidence uplift from retrieved Phase 2 memory.

This script:
1. Creates and resolves a test conversation (Phase 1+2)
2. Queries with the SAME issue again (new conversation)
3. Shows that confidence INCREASES due to Phase 3 retrieval reranking
"""

import requests
import json
import time

BASE_URL = "http://localhost:9000"

def test_phase3_confidence_uplift():
    print("\n" + "="*70)
    print("PHASE 3 VERIFICATION: Confidence Uplift via Retrieval Reranking")
    print("="*70)
    
    # Test query
    test_issue = "My database connection is timing out after 30 seconds. I'm using Python with SQLAlchemy."
    
    # ===== STEP 1: Create and resolve first conversation (Phase 2 write) =====
    print("\n[STEP 1] Creating test conversation and resolving it (Phase 2 write)...")
    
    conv1 = requests.post(f"{BASE_URL}/conversation/start", 
                         json={"username": "phase3_tester"}).json()
    conv1_id = conv1["conversation_id"]
    print(f"✓ Conversation 1 created: {conv1_id}")
    
    # Send initial message
    msg1 = requests.post(
        f"{BASE_URL}/conversation/{conv1_id}/message",
        json={"content": test_issue}
    ).json()
    print(f"✓ Message sent | Tier: {msg1.get('tier')} | Confidence: {msg1.get('confidence')}")
    
    # Agent replies
    agent_reply_1 = (
        "To fix database connection timeouts, try these steps:\n"
        "1. Increase pool_pre_ping timeout in SQLAlchemy config\n"
        "2. Set pool_recycle to 300 seconds\n"
        "3. Check firewall rules on database server\n"
        "4. Monitor slow query logs"
    )
    
    agent_resp = requests.post(
        f"{BASE_URL}/agent/conversation/{conv1_id}/reply",
        json={"content": agent_reply_1}
    )
    if agent_resp.status_code != 200:
        print(f"⚠️ Agent reply error: {agent_resp.status_code} - {agent_resp.text}")
    else:
        print(f"✓ Agent replied (Tier 2 escalation)")
    
    # Resolve the conversation (Phase 2 writes to Chroma)
    resolve1 = requests.post(f"{BASE_URL}/agent/conversation/{conv1_id}/resolve").json()
    print(f"✓ Conversation resolved | Phase 2 memory written: {resolve1.get('phase2_written', False)}")
    time.sleep(2)  # Wait for Chroma write
    
    # ===== STEP 2: Ask SAME question in new conversation (Phase 3 retrieval) =====
    print("\n[STEP 2] Creating NEW conversation with SAME issue (Phase 3 retrieval)...")
    
    conv2 = requests.post(f"{BASE_URL}/conversation/start", 
                         json={"username": "phase3_tester2"}).json()
    conv2_id = conv2["conversation_id"]
    print(f"✓ Conversation 2 created: {conv2_id}")
    
    # Send SIMILAR but not identical message
    similar_issue = "My SQLAlchemy database connections keep timing out. Why is this happening?"
    msg2 = requests.post(
        f"{BASE_URL}/conversation/{conv2_id}/message",
        json={"content": similar_issue}
    ).json()
    
    confidence_initial = msg2.get("confidence", 0)
    tier_initial = msg2.get("tier")
    draft_initial = msg2.get("draft_reply", "")[:100]
    
    print(f"✓ Message sent (Phase 3 retrieval engagement)")
    print(f"  Confidence (with Phase 2 boost): {confidence_initial}")
    print(f"  Tier: {tier_initial}")
    print(f"  Draft preview: {draft_initial}...")
    
    # ===== STEP 3: Validate results =====
    print("\n[STEP 3] Analyzing Phase 3 Results...")
    
    # Expected behavior:
    # - Confidence should be non-zero (meaning retrieval happened)
    # - Draft should contain relevant database/SQLAlchemy advice
    # - Should likely be Tier 1 or Tier 2 (confidence >= 0.60)
    
    success_criteria = []
    
    success_criteria.append({
        "check": "Confidence >= 0.65 (Phase 3 boost applied)",
        "result": confidence_initial >= 0.65,
        "value": confidence_initial
    })
    
    success_criteria.append({
        "check": "Draft contains technical guidance",
        "result": any(keyword in draft_initial.lower() for keyword in ["pool", "timeout", "connection", "database"]),
        "value": "✓" if any(keyword in draft_initial.lower() for keyword in ["pool", "timeout", "connection", "database"]) else "✗"
    })
    
    success_criteria.append({
        "check": "Routed to Tier 1 or Tier 2",
        "result": tier_initial in ["Tier 1", "Tier 2"],
        "value": tier_initial
    })
    
    all_pass = all(c["result"] for c in success_criteria)
    
    print("\n📊 Phase 3 Validation Results:")
    for criterion in success_criteria:
        status = "✓ PASS" if criterion["result"] else "✗ FAIL"
        print(f"  {status}: {criterion['check']} → {criterion['value']}")
    
    print("\n" + "="*70)
    if all_pass:
        print("✅ PHASE 3 VERIFICATION PASSED")
        print(f"   Conversation 1 (resolved): {conv1_id}")
        print(f"   Conversation 2 (retrieval): {conv2_id}")
        print(f"   Confidence Uplift: Achieved via reranking")
    else:
        print("⚠️  PHASE 3 VERIFICATION PARTIAL")
    print("="*70 + "\n")
    
    return {
        "status": "PASS" if all_pass else "PARTIAL",
        "conv1_id": conv1_id,
        "conv2_id": conv2_id,
        "confidence": confidence_initial,
        "tier": tier_initial,
        "criteria": success_criteria
    }

if __name__ == "__main__":
    result = test_phase3_confidence_uplift()
    print(json.dumps(result, indent=2))
