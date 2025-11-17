#!/usr/bin/env python3
"""
Script to initialize Firestore with default WhatsApp configuration
"""
import asyncio
from services.firebase_service import firebase_service

async def init_whatsapp_config():
    """Initialize WhatsApp configuration with default departments"""
    default_departments = [
        {
            'name': 'AMOSTRAS',
            'displayName': 'Amostras e Orçamentos',
            'phone': '5511999999999',  # Placeholder - será configurado pelo admin
            'message': 'Olá! Vim do chat online e gostaria de falar sobre amostras e orçamentos.'
        },
        {
            'name': 'ESTAMPAS',
            'displayName': 'Desenvolvimento de Estampas',
            'phone': '5511999999998',  # Placeholder
            'message': 'Olá! Vim do chat online e gostaria de falar sobre desenvolvimento de estampas.'
        },
        {
            'name': 'VAGAS',
            'displayName': 'Recursos Humanos',
            'phone': '5511999999997',  # Placeholder
            'message': 'Olá! Vim do chat online e gostaria de falar sobre oportunidades de trabalho.'
        },
        {
            'name': 'SUPORTE',
            'displayName': 'Suporte Geral',
            'phone': '5511999999996',  # Placeholder
            'message': 'Olá! Vim do chat online e preciso de suporte.'
        }
    ]
    
    try:
        success = await firebase_service.update_whatsapp_config(default_departments)
        if success:
            print("✅ WhatsApp configuration initialized successfully!")
            print(f"   Created {len(default_departments)} departments")
            for dept in default_departments:
                print(f"   - {dept['displayName']} ({dept['name']})")
        else:
            print("❌ Failed to initialize WhatsApp configuration")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    asyncio.run(init_whatsapp_config())
