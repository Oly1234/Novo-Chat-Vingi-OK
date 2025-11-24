#!/bin/bash

# 🚀 Script de Deploy - Vingi Têxtil
# Execute linha por linha conforme necessário

echo "📦 PASSO 1: Build do Frontend"
echo "cd frontend && yarn build"

echo ""
echo "☁️  PASSO 2: Deploy Backend no Cloud Run"
echo "cd backend"
echo "gcloud run deploy vingi-backend \\"
echo "  --source . \\"
echo "  --platform managed \\"
echo "  --region us-central1 \\"
echo "  --allow-unauthenticated \\"
echo "  --set-env-vars ADMIN_PASSWORD=v1ng1t3x"

echo ""
echo "🔑 PASSO 3: Adicionar OpenAI Key"
echo "gcloud run services update vingi-backend \\"
echo "  --update-env-vars OPENAI_API_KEY=sua-chave-aqui"

echo ""
echo "🌐 PASSO 4: Copiar URL do Backend"
echo "gcloud run services describe vingi-backend --format='value(status.url)'"

echo ""
echo "⚙️  PASSO 5: Atualizar frontend/.env"
echo "REACT_APP_BACKEND_URL=<URL-copiada-acima>"

echo ""
echo "🔨 PASSO 6: Rebuild Frontend com nova URL"
echo "cd frontend && yarn build"

echo ""
echo "🚀 PASSO 7: Deploy Frontend no Firebase"
echo "firebase deploy --only hosting"

echo ""
echo "✅ PASSO 8: Testar Deploy"
echo "Abra: https://seu-projeto.web.app"

echo ""
echo "📊 PASSO 9: Ver logs (se necessário)"
echo "gcloud run logs read --service vingi-backend --limit 50"
