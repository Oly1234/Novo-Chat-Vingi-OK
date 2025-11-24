"""
Script para popular configuração inicial do WhatsApp
"""
import asyncio
from services.firebase_service import firebase_service

async def seed_whatsapp_config():
    """Adiciona configuração padrão do WhatsApp se não existir"""
    
    # Inicializar Firebase
    firebase_service._initialize()
    
    # Verificar se já existe configuração
    existing_config = await firebase_service.get_whatsapp_config()
    
    if existing_config and len(existing_config) > 0:
        print(f"✅ Configuração WhatsApp já existe ({len(existing_config)} departamentos)")
        return
    
    # Configuração padrão
    default_departments = [
        {
            "name": "AMOSTRAS",
            "displayName": "Amostras e Orçamentos",
            "phone": "5511999999999",
            "message": "Olá! Vim do chat online da Vingi Têxtil e gostaria de falar sobre amostras e orçamentos."
        },
        {
            "name": "ESTAMPAS",
            "displayName": "Desenvolvimento de Estampas",
            "phone": "5511999999999",
            "message": "Olá! Vim do chat online da Vingi Têxtil e gostaria de falar sobre estamparia."
        },
        {
            "name": "VAGAS",
            "displayName": "Recursos Humanos",
            "phone": "5511999999999",
            "message": "Olá! Vim do chat online da Vingi Têxtil e gostaria de falar sobre oportunidades de trabalho."
        },
        {
            "name": "SUPORTE",
            "displayName": "Suporte Técnico",
            "phone": "5511999999999",
            "message": "Olá! Vim do chat online da Vingi Têxtil e preciso de suporte."
        }
    ]
    
    # Salvar no Firebase
    success = await firebase_service.update_whatsapp_config(default_departments)
    
    if success:
        print(f"✅ Configuração WhatsApp criada com {len(default_departments)} departamentos")
        print("\n⚠️  IMPORTANTE: Atualize os números de telefone no painel admin!")
    else:
        print("❌ Erro ao criar configuração WhatsApp")

if __name__ == "__main__":
    asyncio.run(seed_whatsapp_config())
