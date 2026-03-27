#!/usr/bin/env python3
"""
Phase 3 Demonstration: Show how stored agent conversations boost confidence

Strategy:
1. Create a very simple, seed-able test query
2. Resolve it with a good agent response (Phase 2 write)
3. Query again with same wording to show confidence boost
4. This demonstrates Phase 3 is correctly retrieving and reranking
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:9000"

def simple_phase3_test():
    print("\n" + "="*70)
    print("PHASE 3 SIMPLE TEST: Agent Memory → Confidence Boost")
    print("="*70)
    
    # Use a very direct query that doesn't need extensive knowledge base
    test_query = "I'm getting 'ECONNREFUSED' errors in my Node.js app. How do I debug this?"
    
    print(f"\n[TEST SETUP] Query: '{test_query}'")
    print("Strategy: Create+resolve → then query again → confidence should boost\n")
    
    # ===== STEP 1: Create first conversation and escalate to agent =====
    print("[STEP 1] Creating first conversation (will be escalated to agent)...")
    
    conv1 = requests.post(f"{BASE_URL}/conversation/start", 
                         json={"username": "phase3_demo"}).json()
    conv1_id = conv1["conversation_id"]
    print(f"  Conversation 1: {conv1_id}")
    
    msg1 = requests.post(
        f"{BASE_URL}/conversation/{conv1_id}/message",
        json={"content": test_query}
    ).json()
    
    confidence_1 = msg1.get("confidence", 0)
    tier_1 = msg1.get("tier")
    print(f"  Initial Confidence: {confidence_1} (Tier: {tier_1})")
    
    if tier_1 not in ["tier2", "tier3"]:
        print(f"  → Query routed to Tier 1 (AI auto-resolved)")
        print(f"  → Need Tier 2/3 for agent memory.")
    else:
        # Agent provides high-quality response
        agent_response = (
            "To reset your password:\n"
            "1. Click 'Forgot Password' on the login page\n"
            "2. Enter your email address\n"
            "3. Check your email for reset link\n"
            "4. Click link and set new password\n"
            "5. Login with new credentials"
        )
        
        reply = requests.post(
            f"{BASE_URL}/agent/conversation/{conv1_id}/reply",
            json={"content": agent_response}
        )
        
        if reply.status_code == 200:
            print(f"  ✓ Agent replied with detailed solution")
            
            # Resolve to trigger Phase 2 write
            resolve = requests.post(f"{BASE_URL}/agent/conversation/{conv1_id}/resolve")
            print(f"  ✓ Conversation resolved (Phase 2 memory stored)")
            time.sleep(2)  # Wait for writes
            
            # ===== STEP 2: Create new conversation with same query =====
            print("\n[STEP 2] Creating second conversation with SAME query...")
            
            conv2 = requests.post(f"{BASE_URL}/conversation/start", 
                                 json={"username": "phase3_demo_user2"}).json()
            conv2_id = conv2["conversation_id"]
            print(f"  Conversation 2: {conv2_id}")
            
            msg2 = requests.post(
                f"{BASE_URL}/conversation/{conv2_id}/message",
                json={"content": test_query}
            ).json()
            
            confidence_2 = msg2.get("confidence", 0)
            tier_2 = msg2.get("tier")
            print(f"  New Confidence: {confidence_2} (Tier: {tier_2})")
            
            # ===== STEP 3: Analyze results =====
            print("\n[STEP 3] Phase 3 Analysis:")
            
            confidence_boost = confidence_2 - confidence_1
            boost_percent = (confidence_boost / confidence_1 * 100) if confidence_1 > 0 else 0
            
            print(f"  Confidence before Phase 2: {confidence_1:.4f}")
            print(f"  Confidence after Phase 2:  {confidence_2:.4f}")
            print(f"  Boost amount:              +{confidence_boost:.4f} ({boost_percent:.1f}%)")
            
            if confidence_boost > 0.05:
                print(f"\n✅ PHASE 3 SUCCESS: Confidence boosted via stored agent memory!")
                return True
            else:
                print(f"\n⚠️ Phase 3 retrieval may not have matched well.")
                print(f"   Stored memory exists but similarity threshold not met.")
                return False
        else:
            print(f"  ✗ Agent reply failed: {reply.status_code}")
            return False
    
    return False

if __name__ == "__main__":
    success = simple_phase3_test()
    print("\n" + "="*70 + "\n")
    sys.exit(0 if success else 1)
