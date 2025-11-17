import os
import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime
import uuid
from typing import Dict, List, Optional

class FirebaseService:
    def __init__(self):
        # Initialize Firebase Admin SDK
        if not firebase_admin._apps:
            # Use application default credentials or service account
            try:
                cred = credentials.ApplicationDefault()
            except:
                # If no service account, initialize with project ID only
                firebase_admin.initialize_app(options={
                    'projectId': os.getenv('FIREBASE_PROJECT_ID'),
                    'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
                })
                self.db = firestore.client()
                self.bucket = None
                return
            
            firebase_admin.initialize_app(cred, {
                'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
            })
        
        self.db = firestore.client()
        try:
            self.bucket = storage.bucket()
        except:
            self.bucket = None
    
    # Session Methods
    async def create_session(self, user_id: str = None) -> Dict:
        """Create a new chat session"""
        session_id = str(uuid.uuid4())
        session_data = {
            'id': session_id,
            'userId': user_id or f'anon_{uuid.uuid4().hex[:8]}',
            'startedAt': firestore.SERVER_TIMESTAMP,
            'status': 'ai',  # ai, waiting, active, closed
            'department': None,
            'currentAgentId': None,
            'metadata': {}
        }
        
        self.db.collection('sessions').document(session_id).set(session_data)
        return {**session_data, 'id': session_id}
    
    async def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session by ID"""
        doc = self.db.collection('sessions').document(session_id).get()
        if doc.exists:
            return {**doc.to_dict(), 'id': doc.id}
        return None
    
    async def update_session(self, session_id: str, data: Dict) -> bool:
        """Update session data"""
        try:
            self.db.collection('sessions').document(session_id).update(data)
            return True
        except:
            return False
    
    # Message Methods
    async def add_message(self, session_id: str, sender: str, text: str, attachments: List = None) -> Dict:
        """Add a message to a session"""
        message_id = str(uuid.uuid4())
        message_data = {
            'id': message_id,
            'sessionId': session_id,
            'sender': sender,  # user, ai, agent, system
            'text': text,
            'attachments': attachments or [],
            'timestamp': firestore.SERVER_TIMESTAMP
        }
        
        self.db.collection('messages').document(message_id).set(message_data)
        return {**message_data, 'id': message_id}
    
    async def get_messages(self, session_id: str, limit: int = 50) -> List[Dict]:
        """Get messages for a session"""
        messages_ref = self.db.collection('messages')
        query = messages_ref.where('sessionId', '==', session_id).order_by('timestamp').limit(limit)
        
        messages = []
        for doc in query.stream():
            messages.append({**doc.to_dict(), 'id': doc.id})
        
        return messages
    
    # WhatsApp Config Methods
    async def get_whatsapp_config(self) -> List[Dict]:
        """Get WhatsApp departments configuration"""
        doc = self.db.collection('config').document('whatsapp').get()
        if doc.exists:
            data = doc.to_dict()
            return data.get('departments', [])
        return []
    
    async def update_whatsapp_config(self, departments: List[Dict]) -> bool:
        """Update WhatsApp departments configuration"""
        try:
            self.db.collection('config').document('whatsapp').set({
                'departments': departments,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
            return True
        except:
            return False
    
    # Queue Methods
    async def add_to_queue(self, session_id: str, department: str, priority: int = 1) -> Dict:
        """Add session to human handoff queue"""
        queue_id = str(uuid.uuid4())
        queue_data = {
            'id': queue_id,
            'sessionId': session_id,
            'department': department,
            'priority': priority,
            'waitingSince': firestore.SERVER_TIMESTAMP,
            'status': 'waiting'  # waiting, assigned, completed
        }
        
        self.db.collection('queue').document(queue_id).set(queue_data)
        return {**queue_data, 'id': queue_id}
    
    async def get_queue(self, department: str = None) -> List[Dict]:
        """Get waiting queue"""
        query = self.db.collection('queue').where('status', '==', 'waiting')
        
        if department:
            query = query.where('department', '==', department)
        
        query = query.order_by('priority', direction=firestore.Query.DESCENDING).order_by('waitingSince')
        
        queue = []
        for doc in query.stream():
            queue.append({**doc.to_dict(), 'id': doc.id})
        
        return queue
    
    # File Upload Methods
    async def upload_file(self, file_data: bytes, filename: str, content_type: str) -> Optional[str]:
        """Upload file to Firebase Storage"""
        if not self.bucket:
            return None
        
        try:
            blob = self.bucket.blob(f'uploads/{uuid.uuid4()}_{filename}')
            blob.upload_from_string(file_data, content_type=content_type)
            blob.make_public()
            return blob.public_url
        except Exception as e:
            print(f'Upload error: {e}')
            return None

# Singleton instance
firebase_service = FirebaseService()
