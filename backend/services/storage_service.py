"""
Storage service using MongoDB
Replaces Firebase for session and message storage
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import uuid
from typing import Dict, List, Optional

class StorageService:
    def __init__(self):
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client['vingi']
        self.sessions = self.db['sessions']
        self.messages = self.db['messages']
        self.config = self.db['config']
        self.queue = self.db['queue']
    
    # Session Methods
    async def create_session(self, user_id: str = None) -> Dict:
        """Create a new chat session"""
        session_id = str(uuid.uuid4())
        session_data = {
            'id': session_id,
            'userId': user_id or f'anon_{uuid.uuid4().hex[:8]}',
            'startedAt': datetime.utcnow(),
            'status': 'ai',
            'department': None,
            'currentAgentId': None,
            'metadata': {}
        }
        
        await self.sessions.insert_one(session_data)
        return session_data
    
    async def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session by ID"""
        session = await self.sessions.find_one({'id': session_id})
        return session
    
    async def update_session(self, session_id: str, data: Dict) -> bool:
        """Update session data"""
        result = await self.sessions.update_one(
            {'id': session_id},
            {'$set': data}
        )
        return result.modified_count > 0
    
    # Message Methods
    async def add_message(self, session_id: str, sender: str, text: str, attachments: List = None) -> Dict:
        """Add a message to a session"""
        message_id = str(uuid.uuid4())
        message_data = {
            'id': message_id,
            'sessionId': session_id,
            'sender': sender,
            'text': text,
            'attachments': attachments or [],
            'timestamp': datetime.utcnow()
        }
        
        await self.messages.insert_one(message_data)
        return message_data
    
    async def get_messages(self, session_id: str, limit: int = 50) -> List[Dict]:
        """Get messages for a session"""
        cursor = self.messages.find({'sessionId': session_id}).sort('timestamp', 1).limit(limit)
        messages = await cursor.to_list(length=limit)
        return messages
    
    # WhatsApp Config Methods
    async def get_whatsapp_config(self) -> List[Dict]:
        """Get WhatsApp departments configuration"""
        config_doc = await self.config.find_one({'type': 'whatsapp'})
        if config_doc:
            return config_doc.get('departments', [])
        return []
    
    async def update_whatsapp_config(self, departments: List[Dict]) -> bool:
        """Update WhatsApp departments configuration"""
        result = await self.config.update_one(
            {'type': 'whatsapp'},
            {'$set': {'departments': departments, 'updatedAt': datetime.utcnow()}},
            upsert=True
        )
        return result.acknowledged
    
    # Queue Methods
    async def add_to_queue(self, session_id: str, department: str, priority: int = 1) -> Dict:
        """Add session to human handoff queue"""
        queue_id = str(uuid.uuid4())
        queue_data = {
            'id': queue_id,
            'sessionId': session_id,
            'department': department,
            'priority': priority,
            'waitingSince': datetime.utcnow(),
            'status': 'waiting'
        }
        
        await self.queue.insert_one(queue_data)
        return queue_data
    
    async def get_queue(self, department: str = None) -> List[Dict]:
        """Get waiting queue"""
        query = {'status': 'waiting'}
        if department:
            query['department'] = department
        
        cursor = self.queue.find(query).sort([('priority', -1), ('waitingSince', 1)])
        queue_list = await cursor.to_list(length=100)
        return queue_list
    
    # File Upload Methods
    async def upload_file(self, file_data: bytes, filename: str, content_type: str) -> Optional[str]:
        """Upload file to GridFS"""
        # For now, return a placeholder URL
        # In production, this would use GridFS or external storage
        return f'/uploads/{uuid.uuid4()}_{filename}'
    
    # Knowledge Base Methods
    async def get_knowledge_base(self) -> List[Dict]:
        """Get knowledge base items"""
        kb_doc = await self.config.find_one({'type': 'knowledge_base'})
        if kb_doc:
            return kb_doc.get('items', [])
        return []
    
    async def update_knowledge_base(self, items: List[Dict]) -> bool:
        """Update knowledge base"""
        result = await self.config.update_one(
            {'type': 'knowledge_base'},
            {'$set': {'items': items, 'updatedAt': datetime.utcnow()}},
            upsert=True
        )
        return result.acknowledged

# Singleton instance
storage_service = StorageService()
