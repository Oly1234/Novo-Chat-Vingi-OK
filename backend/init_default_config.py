#!/usr/bin/env python3
"""
Script to initialize default WhatsApp configuration in MongoDB
"""
import asyncio
import sys
sys.path.append('/app/backend')

from services.storage_service import storage_service

async def init_config():
    """Initialize default WhatsApp configuration"""
    default_departments = [
        {
            'name': 'AMOSTRAS',
            'displayName': 'Amostras e Orçamentos',
            'phone': '5511999999999',
            'message': 'Olá! Vim do chat online e gostaria de falar sobre amostras e orçamentos.'
        },
        {
            'name': 'ESTAMPAS',
            'displayName': 'Desenvolvimento de Estampas',
            'phone': '5511999999998',
            'message': 'Olá! Vim do chat online e gostaria de falar sobre desenvolvimento de estampas.'
        },
        {
            'name': 'VAGAS',
            'displayName': 'Recursos Humanos',
            'phone': '5511999999997',
            'message': 'Olá! Vim do chat online e gostaria de falar sobre oportunidades de trabalho.'
        },
        {
            'name': 'SUPORTE',
            'displayName': 'Suporte Geral',
            'phone': '5511999999996',
            'message': 'Olá! Vim do chat online e preciso de suporte.'
        }
    ]
    
    try:
        success = await storage_service.update_whatsapp_config(default_departments)
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
    asyncio.run(init_config())
