#!/bin/bash

# 🚀 Script de Deploy Automático - Vingi Têxtil
# Execute: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 Iniciando deploy do Vingi Têxtil..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para perguntar sim/não
ask_yes_no() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Por favor responda y ou n.";;
        esac
    done
}

# Verificar se está no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "${RED}❌ Erro: Execute este script no diretório raiz do projeto${NC}"
    exit 1
fi

echo "${GREEN}✓${NC} Diretório correto"

# 1. Build do Frontend
echo ""
echo "${YELLOW}📦 PASSO 1: Build do Frontend${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    yarn install
fi

echo "Fazendo build..."
yarn build

if [ ! -d "build" ]; then
    echo "${RED}❌ Erro: Build falhou${NC}"
    exit 1
fi

echo "${GREEN}✓${NC} Frontend build concluído"
cd ..

# 2. Deploy Backend
echo ""
echo "${YELLOW}☁️  PASSO 2: Deploy Backend (Cloud Run)${NC}"
cd backend

if ask_yes_no "Fazer deploy do backend agora?"; then
    echo "Fazendo deploy..."
    gcloud run deploy vingi-backend \
        --source . \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --set-env-vars ADMIN_PASSWORD=v1ng1t3x
    
    # Pegar URL do backend
    BACKEND_URL=$(gcloud run services describe vingi-backend --region us-central1 --format='value(status.url)')
    echo ""
    echo "${GREEN}✓${NC} Backend URL: ${BACKEND_URL}"
    
    # Perguntar pela OpenAI Key
    echo ""
    read -p "Digite sua OpenAI API Key (ou Enter para pular): " OPENAI_KEY
    if [ ! -z "$OPENAI_KEY" ]; then
        gcloud run services update vingi-backend \
            --region us-central1 \
            --update-env-vars OPENAI_API_KEY=$OPENAI_KEY
        echo "${GREEN}✓${NC} OpenAI Key configurada"
    fi
    
    # Atualizar .env do frontend
    echo ""
    echo "Atualizando frontend/.env com URL do backend..."
    cd ../frontend
    
    # Backup do .env atual
    if [ -f ".env" ]; then
        cp .env .env.backup
    fi
    
    # Criar novo .env
    cat > .env << EOF
REACT_APP_BACKEND_URL=${BACKEND_URL}
REACT_APP_FIREBASE_API_KEY=AIzaSyBDIZzPdKFxkb2ONBEDNxTk6hKpK6s_cBI
REACT_APP_FIREBASE_AUTH_DOMAIN=vingi-textil.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=vingi-textil
REACT_APP_FIREBASE_STORAGE_BUCKET=vingi-textil.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=275665244985
REACT_APP_FIREBASE_APP_ID=1:275665244985:web:df6890622859f6c57ecee8
EOF
    
    echo "${GREEN}✓${NC} .env atualizado"
    
    # Rebuild frontend
    echo "Rebuild do frontend com nova URL..."
    yarn build
    cd ..
else
    echo "${YELLOW}⏭${NC}  Pulando deploy do backend"
    cd ..
fi

# 3. Deploy Frontend
echo ""
echo "${YELLOW}🌐 PASSO 3: Deploy Frontend (Firebase Hosting)${NC}"

if ask_yes_no "Fazer deploy do frontend agora?"; then
    firebase deploy --only hosting
    
    echo ""
    echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "${GREEN}🎉 Deploy Concluído com Sucesso!${NC}"
    echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "${GREEN}Frontend:${NC} https://vingi-textil.web.app"
    if [ ! -z "$BACKEND_URL" ]; then
        echo "${GREEN}Backend:${NC} ${BACKEND_URL}"
    fi
    echo ""
    echo "${YELLOW}📝 Próximos passos:${NC}"
    echo "  1. Acesse o admin: https://vingi-textil.web.app/admin"
    echo "  2. Senha: v1ng1t3x"
    echo "  3. Configure números WhatsApp na aba WhatsApp"
    echo ""
else
    echo "${YELLOW}⏭${NC}  Pulando deploy do frontend"
fi

echo "${GREEN}✓${NC} Script finalizado"
