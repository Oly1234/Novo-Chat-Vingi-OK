"""
Script para popular a Knowledge Base da Vingi Têxtil
"""
import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

KNOWLEDGE_BASE_DATA = [
    {
        "category": "Empresa",
        "title": "Sobre a Vingi Têxtil",
        "content": "A Vingi Têxtil tem 47 anos de experiência transformando ideias em experiências têxteis memoráveis. Parque fabril de 25 mil metros quadrados preparado para atender clientes em todo o Brasil com estamparia digital e cilindro com precisão, consistência e velocidade."
    },
    {
        "category": "Serviços",
        "title": "Estamparia Digital",
        "content": "Estamparia digital de alta definição com impressão de alta resolução. Ideal para rapidez e coleções com maior riqueza de detalhes, cores vivas e fidelidade no detalhe. Capacidade de resposta rápida para coleções ágeis e peças com muita informação visual. Garante estabilidade e repetibilidade lote após lote."
    },
    {
        "category": "Serviços",
        "title": "Estamparia Rotativa Cilindro",
        "content": "Estamparia rotativa em cilindro perfeita para grandes volumes com estabilidade de cor, precisão, solidez de cor e controle absoluto de processo. Escolha ideal para magazines, confecções de alto giro e coleções que exigem custo competitivo. Equipe faz adaptação técnica de arte sem complicação."
    },
    {
        "category": "Serviços",
        "title": "Criação e Adaptação de Arte",
        "content": "Criamos estampas exclusivas para sua marca. Se você já possui uma arte, ajustamos para o processo correto (digital ou cilindro) garantindo fidelidade técnica e melhor resultado no tecido escolhido. Atendimento direto com especialistas, do envio da arte ao fechamento da produção."
    },
    {
        "category": "Produtos",
        "title": "Bases Têxteis Disponíveis",
        "content": "Bases desenvolvidas para moda, fitness, decoração e design: Tela, Cridelia, Panamá, Luena, Munique, Havaí, Lille, Cairo, Lurex, Vienna, Lisboa, Berlim, Viscolycra e Romantic. Todas desenvolvidas para atender principais segmentos do mercado."
    },
    {
        "category": "Atendimento",
        "title": "Amostras e Mostruário",
        "content": "Amostras e mostruários SEM CUSTO para que você decida com segurança. Atendimento direto com especialistas que realmente entendem o processo. Acompanhamento de cada etapa com clareza e agilidade."
    },
    {
        "category": "Atendimento",
        "title": "Entrega e Cobertura",
        "content": "Entrega para todo o Brasil. Cada lote é conferido, revisado e enviado com controle de qualidade com mais de quatro décadas de experiência."
    },
    {
        "category": "Processo",
        "title": "Fluxo de Atendimento",
        "content": "1) Cliente envia interesse; 2) Atendimento direto com especialistas; 3) Amostras gratuitas enviadas; 4) Aprovação do cliente; 5) Produção com acompanhamento; 6) Conferência e revisão; 7) Envio nacional. Você fala com quem realmente entende o processo."
    },
    {
        "category": "Diferenciais",
        "title": "Por que escolher a Vingi",
        "content": "✓ 47 anos de experiência ✓ Atendimento direto ✓ Amostras sem custo ✓ Criação própria e adaptação ✓ Digital e cilindro ✓ Bases têxteis próprias ✓ Entrega nacional ✓ Controle de qualidade rigoroso ✓ Processo completo do início ao fim"
    },
    {
        "category": "Público",
        "title": "Para quem atendemos",
        "content": "Confecção, magazines, atacado, varejo, lojas próprias, designers, marcas de moda, fitness, decoração. Desde pequenas coleções até grandes volumes para magazines e alto giro."
    },
    {
        "category": "Técnico",
        "title": "Capacidade e Estrutura",
        "content": "Parque fabril de 25 mil metros quadrados. Impressoras digitais de alta resolução. Estamparia rotativa com múltiplos cilindros. Setor de criação e design. Controle de qualidade em todas as etapas. Expedição própria para todo Brasil."
    },
    {
        "category": "Contato",
        "title": "Como entrar em contato",
        "content": "Para atendimento especializado, nosso time comercial está pronto para te atender via WhatsApp. Informe nome, WhatsApp e tipo de projeto para ser direcionado ao setor correto (comercial, criação, amostras ou RH)."
    }
]

async def populate_kb():
    try:
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
        client = AsyncIOMotorClient(mongo_url)
        db = client['vingi']
        kb_collection = db['knowledge_base']
        
        # Clear existing KB
        await kb_collection.delete_many({})
        print("✓ Knowledge Base limpa")
        
        # Insert new data
        result = await kb_collection.insert_many(KNOWLEDGE_BASE_DATA)
        print(f"✓ {len(result.inserted_ids)} itens adicionados à Knowledge Base")
        
        # Verify
        count = await kb_collection.count_documents({})
        print(f"✓ Total de itens na KB: {count}")
        
        print("\n📚 Knowledge Base populada com sucesso!")
        
        # Show categories
        categories = await kb_collection.distinct("category")
        print(f"\nCategorias disponíveis: {', '.join(categories)}")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(populate_kb())
