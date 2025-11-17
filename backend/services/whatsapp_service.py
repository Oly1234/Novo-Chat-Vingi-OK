from typing import Dict, Optional
import urllib.parse

class WhatsAppService:
    def __init__(self):
        self.base_url = 'https://wa.me'
    
    def generate_url(self, phone: str, message: str = '') -> str:
        """
        Generate WhatsApp URL with phone and pre-filled message
        Phone format: 55DDNNNNNNNNN (country code + area code + number)
        """
        # Clean phone number (remove special characters)
        clean_phone = ''.join(filter(str.isdigit, phone))
        
        # Ensure country code
        if not clean_phone.startswith('55'):
            clean_phone = '55' + clean_phone
        
        # Encode message
        encoded_message = urllib.parse.quote(message)
        
        # Build URL
        if message:
            return f'{self.base_url}/{clean_phone}?text={encoded_message}'
        return f'{self.base_url}/{clean_phone}'
    
    def build_context_message(self, session_data: Dict, department: str) -> str:
        """
        Build contextualized message for WhatsApp
        """
        user_name = session_data.get('userId', 'Cliente')
        
        messages = {
            'AMOSTRAS': f'Olá! Vim do chat online e gostaria de falar sobre amostras e orçamentos.',
            'ESTAMPAS': f'Olá! Vim do chat online e gostaria de falar sobre desenvolvimento de estampas.',
            'VAGAS': f'Olá! Vim do chat online e gostaria de falar sobre oportunidades de trabalho.',
            'SUPORTE': f'Olá! Vim do chat online e preciso de suporte.'
        }
        
        return messages.get(department, 'Olá! Vim do chat online da Vingi Têxtil.')

# Singleton instance
whatsapp_service = WhatsAppService()
