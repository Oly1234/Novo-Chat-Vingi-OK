#!/usr/bin/env python3
"""
Script para popular a Knowledge Base com informações da Vingi Têxtil
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.firebase_service import firebase_service

# Knowledge Base Completa da Vingi Têxtil
VINGI_KNOWLEDGE_BASE = [
    {
        "category": "EMPRESA",
        "title": "Sobre a Vingi Têxtil",
        "content": "A Vingi Têxtil possui 47 anos de experiência no mercado têxtil. Somos especializados em estamparia digital e cilindro com precisão, consistência e velocidade. Nosso parque fabril possui 25 mil metros quadrados e atendemos clientes em todo o Brasil."
    },
    {
        "category": "SERVIÇOS",
        "title": "Estamparia Digital",
        "content": "Trabalhamos com impressão digital de alta resolução, perfeita para rapidez e coleções com maior riqueza de detalhes. Oferecemos cores vivas, fidelidade no detalhe e capacidade de resposta rápida. Ideal para coleções ágeis e peças com muita informação visual."
    },
    {
        "category": "SERVIÇOS",
        "title": "Estamparia Rotativa em Cilindro",
        "content": "Atendemos grandes volumes com precisão, solidez de cor e controle absoluto de processo. É a escolha certa para magazines, confecções de alto giro e coleções que exigem custo competitivo. Garantimos estabilidade, repetibilidade e entrega consistente lote após lote."
    },
    {
        "category": "PRODUTOS",
        "title": "Bases Têxteis Disponíveis",
        "content": "Nossas bases foram desenvolvidas para atender os principais segmentos do mercado: moda, fitness, decoração e design. Bases disponíveis: Tela, Cridelia, Panamá, Luena, Munique, Havaí, Lille, Cairo, Lurex, Vienna, Lisboa, Berlim, Viscolycra e Romantic."
    },
    {
        "category": "SERVIÇOS",
        "title": "Criação e Adaptação de Estampas",
        "content": "Criamos estampas exclusivas para sua marca. Se você já possui uma arte, nós ajustamos para o processo correto — seja digital ou cilindro — garantindo fidelidade técnica e o melhor resultado no tecido escolhido."
    },
    {
        "category": "ATENDIMENTO",
        "title": "Como Funciona o Atendimento",
        "content": "Nosso atendimento é direto com especialistas. Do envio da arte ao fechamento da produção, acompanhamos cada etapa com clareza e agilidade. Você fala com quem realmente entende o processo."
    },
    {
        "category": "AMOSTRAS",
        "title": "Amostras e Mostruário",
        "content": "Oferecemos amostras e mostruários sem custo para que você decida com segurança. Entre em contato com nosso departamento comercial para solicitar."
    },
    {
        "category": "ENTREGA",
        "title": "Entrega Nacional",
        "content": "Entregamos para todo o Brasil. Cada lote é conferido, revisado e enviado com o controle de qualidade que nos acompanha há mais de quatro décadas."
    },
    {
        "category": "PROCESSO",
        "title": "Tempo de Entrega",
        "content": "O prazo de entrega varia conforme o tipo de produto, quantidade e processo (digital ou cilindro). Para orçamento específico com prazo, entre em contato com nosso departamento comercial."
    },
    {
        "category": "PRODUTOS",
        "title": "Viscolycra",
        "content": "Viscolycra é uma de nossas bases têxteis disponíveis. É um tecido versátil, confortável e com boa elasticidade, ideal para diversas aplicações na moda. Podemos estampar em Viscolycra tanto no processo digital quanto em cilindro."
    },
    {
        "category": "DEPARTAMENTOS",
        "title": "Departamentos Disponíveis",
        "content": "Comercial: Para orçamentos, pedidos e informações sobre produtos. RH: Para candidaturas e informações sobre vagas. Financeiro: Para questões de pagamento e faturamento. Suporte: Para dúvidas técnicas e pós-venda."
    },
    {
        "category": "BENEFÍCIOS",
        "title": "Por Que Escolher a Vingi",
        "content": "• Atendimento direto com especialistas • Amostras e mostruário sem custo • Criação própria e adaptação de arte • Processo completo: digital e cilindro • Bases têxteis próprias • Entrega nacional • 47 anos de experiência • Controle de qualidade rigoroso"
    },
    {
        "category": "VAGAS",
        "title": "Trabalhe Conosco",
        "content": "A Vingi Têxtil está sempre em busca de novos talentos. Para se candidatar, você precisa fornecer seu nome, WhatsApp, email e enviar seu currículo. Nossa equipe de RH analisará sua candidatura e entrará em contato."
    }
]

async def populate_knowledge_base():
    """Popula a knowledge base do Firebase"""
    print("🔥 Populando Knowledge Base da Vingi Têxtil...")
    
    try:
        # Inicializar Firebase
        firebase_service._initialize()
        print("✅ Firebase inicializado")
        
        # Atualizar knowledge base
        success = await firebase_service.update_knowledge_base(VINGI_KNOWLEDGE_BASE)
        
        if success:
            print(f"✅ Knowledge Base populada com {len(VINGI_KNOWLEDGE_BASE)} itens!")
            print("\nItens adicionados:")
            for item in VINGI_KNOWLEDGE_BASE:
                print(f"  - [{item['category']}] {item['title']}")
        else:
            print("❌ Erro ao popular Knowledge Base")
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(populate_knowledge_base())
