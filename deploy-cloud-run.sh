#!/bin/bash

# ============================================
# Script de Deploy - Cloud Run
# ============================================

set -e

echo "🚀 Iniciando deploy no Google Cloud Run..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "backend/Dockerfile" ]; then
    echo -e "${RED}❌ Erro: Execute este script da raiz do projeto (/app)${NC}"
    exit 1
fi

# Variáveis
PROJECT_ID="agenda-44f53"
SERVICE_NAME="vingi-backend"
REGION="us-central1"

echo -e "${YELLOW}📋 Configurações:${NC}"
echo "   Project ID: $PROJECT_ID"
echo "   Service: $SERVICE_NAME"
echo "   Region: $REGION"
echo ""

# Verificar autenticação
echo -e "${YELLOW}🔐 Verificando autenticação...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo -e "${RED}❌ Você não está autenticado no Google Cloud${NC}"
    echo "Execute: gcloud auth login"
    exit 1
fi

# Configurar projeto
echo -e "${GREEN}✅ Configurando projeto...${NC}"
gcloud config set project $PROJECT_ID

# Entrar no diretório backend
cd backend

echo ""
echo -e "${YELLOW}🏗️  Iniciando build e deploy...${NC}"
echo ""

# Deploy com todas as variáveis de ambiente
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10 \
  --set-env-vars="OPENAI_API_KEY=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,CORS_ORIGINS=*,ADMIN_PASSWORD=v1ng1t3x,GOOGLE_CLOUD_PROJECT=agenda-44f53,FIREBASE_PROJECT_ID=agenda-44f53,FIREBASE_STORAGE_BUCKET=agenda-44f53.firebasestorage.app"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
    echo ""
    echo -e "${YELLOW}🧪 Testando o serviço...${NC}"
    
    # Obter URL do serviço
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
    
    echo "   URL: $SERVICE_URL"
    echo ""
    
    # Testar health check
    echo "   Testando /health..."
    HEALTH_RESPONSE=$(curl -s "$SERVICE_URL/health")
    echo "   Resposta: $HEALTH_RESPONSE"
    
    # Testar API root
    echo ""
    echo "   Testando /api/..."
    API_RESPONSE=$(curl -s "$SERVICE_URL/api/")
    echo "   Resposta: $API_RESPONSE"
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ BACKEND NO AR!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}📝 Próximos passos:${NC}"
    echo ""
    echo "   1. Atualizar frontend/.env.production:"
    echo "      REACT_APP_BACKEND_URL=$SERVICE_URL"
    echo ""
    echo "   2. Build e deploy do frontend:"
    echo "      cd /app/frontend"
    echo "      yarn build"
    echo "      firebase deploy --only hosting"
    echo ""
    echo -e "${YELLOW}📊 Para ver logs:${NC}"
    echo "   gcloud run logs tail $SERVICE_NAME --region=$REGION"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deploy falhou!${NC}"
    echo ""
    echo -e "${YELLOW}📊 Verificar logs:${NC}"
    echo "   gcloud run logs tail $SERVICE_NAME --region=$REGION"
    echo ""
    exit 1
fi
