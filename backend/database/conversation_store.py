from datetime import datetime
from threading import Lock
from uuid import uuid4

from backend.models.conversation_models import Conversation, ConversationStatus, Message


class ConversationStore:
    def __init__(self) -> None:
        self._conversations: dict[str, Conversation] = {}
        self._messages: dict[str, list[Message]] = {}
        self._lock = Lock()

    def start_conversation(self, username: str) -> Conversation:
        with self._lock:
            conversation_id = str(uuid4())
            now = datetime.utcnow()
            conversation = Conversation(
                conversation_id=conversation_id,
                username=username.strip(),
                status="ai_handling",
                pending_agent_draft=None,
                created_at=now,
                updated_at=now,
            )
            self._conversations[conversation_id] = conversation
            self._messages[conversation_id] = []
            return conversation

    def get_conversation(self, conversation_id: str) -> Conversation | None:
        return self._conversations.get(conversation_id)

    def update_conversation_status(
        self, conversation_id: str, status: ConversationStatus
    ) -> Conversation | None:
        with self._lock:
            conversation = self._conversations.get(conversation_id)
            if not conversation:
                return None

            updated = conversation.model_copy(
                update={"status": status, "updated_at": datetime.utcnow()}
            )
            self._conversations[conversation_id] = updated
            return updated

    def update_pending_agent_draft(
        self, conversation_id: str, draft: str | None
    ) -> Conversation | None:
        with self._lock:
            conversation = self._conversations.get(conversation_id)
            if not conversation:
                return None

            updated = conversation.model_copy(
                update={"pending_agent_draft": draft, "updated_at": datetime.utcnow()}
            )
            self._conversations[conversation_id] = updated
            return updated

    def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        confidence: float | None = None,
        tier: str | None = None,
        agent_draft_reply: str | None = None,
    ) -> Message | None:
        with self._lock:
            conversation = self._conversations.get(conversation_id)
            if not conversation:
                return None

            message = Message(
                message_id=str(uuid4()),
                conversation_id=conversation_id,
                role=role,
                content=content,
                confidence=confidence,
                tier=tier,
                agent_draft_reply=agent_draft_reply,
                timestamp=datetime.utcnow(),
            )
            self._messages[conversation_id].append(message)

            updated = conversation.model_copy(update={"updated_at": datetime.utcnow()})
            self._conversations[conversation_id] = updated
            return message

    def get_history(self, conversation_id: str) -> list[Message]:
        return self._messages.get(conversation_id, [])

    def get_user_conversations(self, username: str) -> list[Conversation]:
        normalized = username.strip().lower()
        result = [
            conversation
            for conversation in self._conversations.values()
            if conversation.username.lower() == normalized
        ]
        return sorted(result, key=lambda row: row.updated_at, reverse=True)

    def get_agent_conversations(self) -> list[Conversation]:
        result = [
            conversation
            for conversation in self._conversations.values()
            if conversation.status in ["pending_agent", "agent_handling"]
        ]
        return sorted(result, key=lambda row: row.updated_at, reverse=True)

    def get_all_conversations(self) -> list[Conversation]:
        return sorted(self._conversations.values(), key=lambda row: row.updated_at, reverse=True)


conversation_store = ConversationStore()
