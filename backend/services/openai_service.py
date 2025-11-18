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

REGRAS CRÍTICAS:
- NUNCA invente informações (preços, vagas, processos, contatos)
- Use APENAS as informações fornecidas na base de conhecimento
- Se não souber algo, seja honesto e sugira falar com um atendente
- Sempre responda em português brasileiro de forma clara e objetiva
- Não mencione sites ou páginas externas a menos que estejam na base de conhecimento
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

IMPORTANTE - Siga este fluxo RIGOROSAMENTE:
1. Agradeça o interesse de forma calorosa
2. Colete as seguintes informações, UMA POR VEZ:
   a) NOME COMPLETO
   b) NÚMERO DE WHATSAPP (com DDD - formato: (XX) XXXXX-XXXX)
   c) EMAIL (validar formato)
   d) ÁREA/CARGO DE INTERESSE
   e) EXPERIÊNCIA PRÉVIA (breve resumo)
   f) DISPONIBILIDADE para início

3. Após coletar TODAS as informações, informe:
   "Perfeito! Agora preciso que você envie seu currículo em formato PDF ou DOC.
   Você pode fazer o upload aqui mesmo no chat ou entrar em contato via WhatsApp no número que você forneceu.
   Nossa equipe de RH analisará seu perfil e retornará em breve!"

REGRAS CRÍTICAS:
- NÃO mencione site de carreiras
- NÃO invente processos seletivos ou vagas específicas
- NÃO diga que há vagas abertas se não tiver certeza
- Seja amigável mas objetivo
- Pergunte uma informação por vez
- Confirme cada dado recebido antes de prosseguir
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
    
    async def chat(self, messages: List[Dict], department: str = None, knowledge_base: List[Dict] = None) -> Dict:
        """
        Send messages to OpenAI and get response
        Returns: {text: str, department: str (if detected)}
        """
        try:
            # Select system prompt
            system_prompt = self.system_prompts.get(department or 'default', self.system_prompts['default'])
            
            # Add knowledge base to system prompt if available
            if knowledge_base and len(knowledge_base) > 0:
                kb_text = "\n\nINFORMAÇÕES DA EMPRESA (use quando relevante):\n"
                for item in knowledge_base:
                    kb_text += f"\n[{item.get('category', 'Info')}] {item.get('title', '')}: {item.get('content', '')}"
                system_prompt += kb_text
            
            # Add instructions for focused responses
            system_prompt += "\n\nIMPORTANTE: Responda APENAS o que foi perguntado. Seja direto e objetivo. Não mencione nomes de pessoas, emails ou documentos a menos que seja estritamente necessário."
            
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
            # Check keywords for quick detection
            message_lower = message.lower()
            
            # VAGAS keywords
            vagas_keywords = ['trabalh', 'emprego', 'vaga', 'curriculo', 'currícul', 'carreira', 'contrata', 'rh']
            if any(keyword in message_lower for keyword in vagas_keywords):
                return 'VAGAS'
            
            # AMOSTRAS keywords
            amostras_keywords = ['amostra', 'orçamento', 'comprar', 'preço', 'valor', 'pedido', 'produto']
            if any(keyword in message_lower for keyword in amostras_keywords):
                return 'AMOSTRAS'
            
            # ESTAMPAS keywords
            estampas_keywords = ['estampa', 'design', 'criar', 'desenho', 'arte', 'personaliza']
            if any(keyword in message_lower for keyword in estampas_keywords):
                return 'ESTAMPAS'
            
            # Use AI for ambiguous cases
            prompt = f"""
Analise a mensagem do cliente e identifique a intenção principal.
Retorne APENAS uma palavra: AMOSTRAS, ESTAMPAS, VAGAS, SUPORTE ou NONE

Contexto:
- VAGAS: candidatura, emprego, trabalhar na empresa, enviar currículo
- AMOSTRAS: pedir amostras, fazer orçamento, comprar produtos
- ESTAMPAS: criar/desenvolver estampas ou designs personalizados
- SUPORTE: dúvidas gerais, reclamações, informações
- NONE: saudações iniciais ou mensagens genéricas

Mensagem: "{message}"

Categoria:
"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{'role': 'user', 'content': prompt}],
                temperature=0.2,
                max_tokens=10
            )
            
            category = response.choices[0].message.content.strip().upper()
            
            if category in ['AMOSTRAS', 'ESTAMPAS', 'VAGAS', 'SUPORTE']:
                return category
            
            return None
            
        except Exception as e:
            print(f"Department detection error: {e}")
            return None

# Singleton instance
openai_service = OpenAIService()
