import os
from openai import OpenAI
from typing import List, Dict, Optional
import json

class OpenAIService:
    def __init__(self):
        self._client = None
        self.model = 'gpt-4o-mini'  # Using GPT-4o-mini for cost efficiency
        
        # System prompts por departamento
        self.system_prompts = {
            'default': """
Você é um assistente virtual da Vingi Têxtil, uma empresa especializada em produtos têxteis.
Seja simpático, profissional e prestativo. Ajude os clientes a encontrar informações sobre:
- Amostras e orçamentos
- Estampas e desenvolvimento de produtos
- Oportunidades de emprego
- Suporte geral

Quando identificar a intenção do cliente, categorize em:
- AMOSTRAS: Para solicitações de amostras, orçamentos, compras
- ESTAMPAS: Para desenvolvimento de estampas, criação de designs
- VAGAS: Para candidaturas, currículos, oportunidades de trabalho
- SUPORTE: Para dúvidas gerais, reclamações, sugestões

Sempre responda em português brasileiro de forma clara e objetiva.
""",
            'AMOSTRAS': """
Você está auxiliando um cliente interessado em amostras e orçamentos.
Pergunte sobre:
- Tipo de produto desejado
- Quantidade
- Prazo de entrega
- Detalhes específicos (cores, tamanhos, etc)
""",
            'ESTAMPAS': """
Você está auxiliando um cliente interessado em desenvolvimento de estampas.
Pergunte sobre:
- Tipo de estampa desejada
- Aplicação (camisetas, tecidos, etc)
- Referências visuais
- Quantidade
""",
            'VAGAS': """
Você está auxiliando um candidato interessado em trabalhar na Vingi Têxtil.
Pergunte sobre:
- Área de interesse
- Experiência profissional
- Disponibilidade
Solicite o currículo em PDF ou DOC.
""",
            'SUPORTE': """
Você está prestando suporte geral ao cliente.
Seja atencioso e resolva dúvidas de forma clara.
"""
        }
    
    @property
    def client(self):
        if not self._client:
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                raise ValueError('OPENAI_API_KEY not set in environment')
            self._client = OpenAI(api_key=api_key)
        return self._client
    
    async def chat(self, messages: List[Dict], department: str = None) -> Dict:
        """
        Send messages to OpenAI and get response
        Returns: {text: str, department: str (if detected)}
        """
        try:
            # Select system prompt
            system_prompt = self.system_prompts.get(department or 'default', self.system_prompts['default'])
            
            # Build messages for API
            api_messages = [
                {'role': 'system', 'content': system_prompt}
            ]
            
            # Add conversation history
            for msg in messages:
                role = 'user' if msg['sender'] == 'user' else 'assistant'
                api_messages.append({
                    'role': role,
                    'content': msg['text']
                })
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=api_messages,
                temperature=0.7,
                max_tokens=500
            )
            
            reply_text = response.choices[0].message.content
            
            # Detect department if not already set
            detected_department = None
            if not department:
                detected_department = await self._detect_department(messages[-1]['text'])
            
            return {
                'text': reply_text,
                'department': detected_department or department
            }
            
        except Exception as e:
            print(f'OpenAI error: {e}')
            return {
                'text': 'Desculpe, estou com dificuldades no momento. Pode tentar novamente?',
                'department': None
            }
    
    async def _detect_department(self, message: str) -> Optional[str]:
        """Detect user intent/department from message"""
        try:
            prompt = f"""
Analise a mensagem do cliente e identifique a intenção.
Retorne APENAS uma das opções: AMOSTRAS, ESTAMPAS, VAGAS, SUPORTE ou NONE

Mensagem: "{message}"

Categoria:
"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{'role': 'user', 'content': prompt}],
                temperature=0.3,
                max_tokens=10
            )
            
            category = response.choices[0].message.content.strip().upper()
            
            if category in ['AMOSTRAS', 'ESTAMPAS', 'VAGAS', 'SUPORTE']:
                return category
            
            return None
            
        except:
            return None

# Singleton instance
openai_service = OpenAIService()
