import chromadb
from chromadb.utils import embedding_functions
import os

import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
client = chromadb.PersistentClient(path=os.path.join(BASE_DIR, "chroma_db"))

# Use a local embedding model (no API cost for embedding)
embedding_model = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

collection = client.get_or_create_collection(
    name="support_tickets_v2",
    embedding_function=embedding_model,
    metadata={"hnsw:space": "cosine"}  # ← add this line
)

def seed_knowledge_base():
    # Check if already seeded to avoid duplicates
    if collection.count() > 0:
        return

    seeds = [
    {"ticket": "How do I reset my password?", "reply": "Go to Settings > Security > Reset Password. You'll receive an email with a reset link within 2 minutes.", "cat": "Password reset"},
    {"ticket": "VPN is not connecting on Mac", "reply": "Ensure Tunnelblick is updated and re-import the config file. If the issue persists, restart the VPN service.", "cat": "VPN"},
    {"ticket": "My account is locked", "reply": "Accounts lock after 5 failed attempts. Please wait 30 minutes or contact support to unlock immediately.", "cat": "Account locked"},
    {"ticket": "Where can I find my latest invoice?", "reply": "Invoices are under Billing > History in your dashboard. You can download PDF copies from there.", "cat": "Billing"},
    {"ticket": "How do I install the software on Windows?", "reply": "Download the installer from our website, run it as administrator, and follow the setup wizard. Restart your machine after installation.", "cat": "Software installation"},
    {"ticket": "My computer is running very slowly", "reply": "Try restarting your machine first. If the issue persists, clear your cache, close unused applications, and check for pending system updates.", "cat": "Slow performance"},
    {"ticket": "I am not receiving any emails", "reply": "Check your spam/junk folder first. If emails are missing, verify your email settings under Account > Email Preferences and ensure your inbox is not full.", "cat": "Email not working"},
    {"ticket": "I need help with something not listed here", "reply": "Thank you for reaching out. Could you please describe your issue in more detail? Our support team will get back to you as soon as possible.", "cat": "General"},
    {"ticket": "How do I update my billing information?", "reply": "Go to Account > Billing > Payment Methods. You can add, remove or update your card details there.", "cat": "Billing"},
    {"ticket": "VPN keeps disconnecting frequently", "reply": "Try switching VPN servers, check your internet connection stability, and ensure your firewall isn't blocking the VPN client.", "cat": "VPN"},
]

    collection.add(
        documents=[s["ticket"] for s in seeds],
        metadatas=[{"reply": s["reply"], "source": "static"} for s in seeds],
        ids=[f"seed_{i}" for i in range(len(seeds))]
    )
    print("✅ Knowledge base seeded.")

def get_collection():
    return collection