from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
from services.firebase_service import firebase_service

router = APIRouter(prefix="/knowledge", tags=["knowledge"])
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'v1ng1t3x')

class KnowledgeArticle(BaseModel):
    topic: str
    content: str
    keywords: str
    category: Optional[str] = "geral"
    updatedBy: Optional[str] = "Admin"

# Conteúdo inicial rico para Base de Conhecimento
INITIAL_ARTICLES = [
    {
        "topic": "Tipos de Tecidos Têxteis",
        "content": """# Tipos de Tecidos Têxteis

## Algodão
O algodão é uma das fibras naturais mais populares no mercado têxtil. Características:
- **Conforto**: Macio e respirável
- **Durabilidade**: Resistente a lavagens frequentes
- **Versatilidade**: Usado em roupas casuais, cama, mesa e banho
- **Cuidados**: Pode ser lavado em máquina a 40°C

## Poliéster
Fibra sintética amplamente utilizada na indústria:
- **Resistência**: Não amassa facilmente
- **Secagem rápida**: Ideal para peças esportivas
- **Custo-benefício**: Preço acessível
- **Mistura**: Frequentemente combinado com algodão (50/50)

## Linho
Tecido nobre e sofisticado:
- **Elegância**: Visual clean e refinado
- **Frescor**: Perfeito para climas quentes
- **Características**: Amassa com facilidade (faz parte do charme)
- **Uso**: Roupas sociais, cama e mesa de luxo""",
        "keywords": "tecidos, algodão, poliéster, linho, fibras, têxtil",
        "category": "produtos"
    },
    {
        "topic": "Como Calcular Metragem de Tecido",
        "content": """# Como Calcular Metragem de Tecido

## Fórmula Básica
Para calcular a quantidade de tecido necessária:

**Metragem = (Altura da peça + bainha) × Número de partes**

## Exemplos Práticos

### Vestido Simples (tamanho M)
- Comprimento: 1,20m
- Bainha: 0,10m
- Total: **1,30m de tecido**

### Calça (tamanho M-G)
- Comprimento: 1,10m por perna
- 2 pernas = 2,20m
- Acréscimo de folga: 0,30m
- Total: **2,50m de tecido**

### Lençol de Casal
- Largura padrão do tecido: 2,80m
- Comprimento necessário: 2,60m
- Total: **2,60m de tecido**

## Dicas Importantes
✅ Sempre compre 10-20% a mais para margem de erro
✅ Considere o sentido do tecido (estampado/listrado)
✅ Pergunte sempre sobre a largura do tecido (varia de 1,40m a 2,80m)""",
        "keywords": "metragem, cálculo, quantidade, tecido, medidas",
        "category": "tutoriais"
    },
    {
        "topic": "Política de Trocas e Devoluções",
        "content": """# Política de Trocas e Devoluções

## Prazo para Troca
- **Loja física**: até 7 dias corridos
- **Compra online**: até 7 dias corridos (direito de arrependimento)
- **Produto com defeito**: até 30 dias corridos

## Condições para Troca
✅ Produto sem uso
✅ Etiqueta original anexada
✅ Nota fiscal
✅ Embalagem original preservada

## Produtos NÃO Trocáveis
❌ Tecidos cortados sob medida
❌ Produtos personalizados
❌ Itens em promoção especial (verificar condições)

## Como Solicitar
1. Entre em contato via WhatsApp ou e-mail
2. Informe número do pedido
3. Descreva o motivo da troca
4. Aguarde autorização e instruções

## Reembolso
- Processado em até 7 dias úteis após recebimento do produto
- Valor creditado na mesma forma de pagamento original""",
        "keywords": "troca, devolução, reembolso, política, garantia",
        "category": "atendimento"
    },
    {
        "topic": "Cuidados com Tecidos: Guia de Lavagem",
        "content": """# Cuidados com Tecidos: Guia de Lavagem

## Símbolos de Lavagem

### 🌊 Temperatura da Água
- **30°C**: Tecidos delicados (seda, lã)
- **40°C**: Roupas do dia a dia (algodão misto)
- **60°C**: Roupas de cama, toalhas
- **90°C**: Tecidos brancos resistentes

## Cuidados por Tipo de Tecido

### Algodão
- Lavar do avesso
- Temperatura até 60°C
- Pode usar secadora em temperatura baixa
- Passar enquanto levemente úmido

### Seda
- Lavar à mão ou ciclo delicado
- Água fria (máx. 30°C)
- Não torcer
- Secar à sombra
- Passar com ferro morno

### Poliéster
- Lavar em água fria/morna
- Não usar alvejante
- Secar rapidamente (não amassa)
- Ferro em temperatura baixa

### Linho
- Lavar em água fria
- Pode usar alvejante (se branco)
- Secar na horizontal
- Passar ainda úmido com ferro quente

## Dicas Gerais
✅ Separar roupas claras de escuras
✅ Fechar zíperes e botões antes de lavar
✅ Virar roupas estampadas do avesso
✅ Não sobrecarregar a máquina""",
        "keywords": "lavagem, cuidados, tecidos, manutenção, limpeza",
        "category": "tutoriais"
    },
    {
        "topic": "Diferença entre Tecido Plano e Malha",
        "content": """# Diferença entre Tecido Plano e Malha

## Tecido Plano
Produzido em tear com fios entrelaçados em ângulo de 90°.

### Características
- Estrutura firme e rígida
- Baixa elasticidade
- Não deforma facilmente
- Amarrota mais

### Exemplos
- Jeans
- Linho
- Oxford
- Tricoline
- Cetim

### Uso
Roupas sociais, calças, camisas, vestidos estruturados

## Malha
Produzida com fios entrelaçados formando laçadas.

### Características
- Estrutura flexível
- Alta elasticidade
- Confortável
- Amarra menos

### Exemplos
- Jersey
- Ribana
- Moletom
- Piquet
- Malha PV

### Uso
Camisetas, roupas esportivas, lingerie, pijamas

## Quando Usar Cada Um?

**Tecido Plano**: Quando precisa de estrutura e caimento formal
**Malha**: Quando precisa de conforto e mobilidade

💡 **Dica**: Muitas peças combinam os dois! Ex: Calça jeans (plano) com camiseta (malha)""",
        "keywords": "tecido plano, malha, diferença, tipos, características",
        "category": "produtos"
    },
    {
        "topic": "Como Fazer um Orçamento de Tecido",
        "content": """# Como Fazer um Orçamento de Tecido

## Informações Necessárias

Para orçar tecido, precisamos de:
1. **Tipo de projeto**: Roupa, decoração, artesanato?
2. **Metragem aproximada**: Quantidade estimada
3. **Tipo de tecido**: Algodão, linho, poliéster, etc.
4. **Prazo de entrega**: Urgente ou normal?

## Processo de Orçamento

### Passo 1: Entre em Contato
- WhatsApp: (disponível na aba de configurações)
- E-mail: contato@vingitextil.com
- Chat online deste sistema

### Passo 2: Forneça Detalhes
Quanto mais informações, melhor o orçamento:
- Fotos de referência
- Cores desejadas
- Acabamento (se aplicável)
- Quantidade

### Passo 3: Receba o Orçamento
- Prazo: até 24h úteis
- Validade: 7 dias
- Inclui: preço, disponibilidade, prazo

### Passo 4: Aprovação
- Aceitar orçamento
- Definir forma de pagamento
- Agendar retirada/entrega

## Formas de Pagamento
💳 Cartão (crédito/débito)
💵 Dinheiro
📱 PIX (5% desconto)
📄 Boleto (até 3x sem juros)

## Descontos Especiais
- Compra acima de 50m: 10% desconto
- Clientes corporativos: condições especiais
- Primeira compra: 5% desconto""",
        "keywords": "orçamento, preço, cotação, compra, pedido",
        "category": "atendimento"
    }
]

@router.get("")
async def get_knowledge_articles(x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        articles = await firebase_service.get_documents('knowledge_base')
        
        # Se não houver artigos, criar os iniciais
        if not articles:
            for article in INITIAL_ARTICLES:
                article['createdAt'] = datetime.utcnow().isoformat()
                article['updatedAt'] = datetime.utcnow().isoformat()
                await firebase_service.create_document('knowledge_base', article)
            
            articles = await firebase_service.get_documents('knowledge_base')
        
        return articles
    except Exception as e:
        print(f"Error fetching knowledge articles: {e}")
        return []

@router.post("")
async def create_article(article: KnowledgeArticle, x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        article_data = article.dict()
        article_data['createdAt'] = datetime.utcnow().isoformat()
        article_data['updatedAt'] = datetime.utcnow().isoformat()
        
        article_id = await firebase_service.create_document('knowledge_base', article_data)
        return {"id": article_id, **article_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{article_id}")
async def update_article(article_id: str, article: KnowledgeArticle, x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        article_data = article.dict()
        article_data['updatedAt'] = datetime.utcnow().isoformat()
        
        await firebase_service.update_document('knowledge_base', article_id, article_data)
        return {"id": article_id, **article_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{article_id}")
async def delete_article(article_id: str, x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        await firebase_service.delete_document('knowledge_base', article_id)
        return {"message": "Article deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
