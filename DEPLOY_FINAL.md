# 🚀 Deploy DEFINITIVO - Vingi Têxtil

## ✅ Tudo Pronto! Arquivos Criados:

- ✅ `backend/Dockerfile` - Container Docker
- ✅ `backend/Procfile` - Alternativa ao Docker
- ✅ `backend/.dockerignore` - Arquivos ignorados
- ✅ `backend/.gcloudignore` - Arquivos ignorados no Cloud
- ✅ `firebase.json` - Config Firebase Hosting
- ✅ `.firebaserc` - Projeto Firebase
- ✅ `deploy.sh` - Script automático de deploy

---

## 🎯 Opção 1: Deploy Automático (RECOMENDADO)

```bash
# No diretório raiz do projeto
chmod +x deploy.sh
./deploy.sh
```

**O script vai:**
1. ✅ Build do frontend
2. ✅ Deploy do backend (Cloud Run)
3. ✅ Configurar OpenAI Key
4. ✅ Atualizar .env do frontend
5. ✅ Rebuild do frontend
6. ✅ Deploy do frontend (Firebase)

---

## 🎯 Opção 2: Deploy Manual (Passo a Passo)

### 1️⃣ Build Frontend

```bash
cd frontend
yarn install
yarn build
cd ..
```

### 2️⃣ Deploy Backend

```bash
cd backend

# Deploy
gcloud run deploy vingi-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars ADMIN_PASSWORD=v1ng1t3x

# Adicionar OpenAI Key
gcloud run services update vingi-backend \
  --region us-central1 \
  --update-env-vars OPENAI_API_KEY=sua-chave-aqui

# Pegar URL do backend
gcloud run services describe vingi-backend \
  --region us-central1 \
  --format='value(status.url)'
```

### 3️⃣ Atualizar Frontend .env

```bash
cd frontend
nano .env
```

**Cole isso (substitua BACKEND_URL):**

```env
REACT_APP_BACKEND_URL=https://vingi-backend-xxxxx-uc.a.run.app
REACT_APP_FIREBASE_API_KEY=AIzaSyBDIZzPdKFxkb2ONBEDNxTk6hKpK6s_cBI
REACT_APP_FIREBASE_AUTH_DOMAIN=vingi-textil.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=vingi-textil
REACT_APP_FIREBASE_STORAGE_BUCKET=vingi-textil.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=275665244985
REACT_APP_FIREBASE_APP_ID=1:275665244985:web:df6890622859f6c57ecee8
```

### 4️⃣ Rebuild e Deploy Frontend

```bash
yarn build
cd ..
firebase deploy --only hosting
```

---

## 🔍 Verificar Deploy

```bash
# Ver logs do backend
gcloud run logs read --service vingi-backend --region us-central1 --limit 50

# Testar backend
curl https://vingi-backend-xxxxx-uc.a.run.app/api/

# Testar frontend
open https://vingi-textil.web.app
```

---

## 🆘 Troubleshooting

### Backend não sobe

```bash
# Ver logs detalhados
gcloud builds list --limit=1 --region=us-central1

# Ver detalhes do serviço
gcloud run services describe vingi-backend --region us-central1
```

### Build do frontend falha

```bash
cd frontend
rm -rf node_modules build
yarn install
yarn build
```

### Firebase deploy falha

```bash
# Re-login
firebase login --reauth

# Verificar projeto
firebase projects:list

# Deploy novamente
firebase deploy --only hosting
```

### CORS error

O backend já está configurado com CORS. Se o erro persistir:

1. Verifique se a URL do backend no `.env` está correta
2. Faça rebuild do frontend após mudar `.env`
3. Limpe cache do navegador

---

## 📊 URLs Finais

**Frontend:** https://vingi-textil.web.app
**Backend:** https://vingi-backend-xxxxx-uc.a.run.app (aparece após deploy)

**Admin:**
- URL: https://vingi-textil.web.app/admin
- Senha: `v1ng1t3x`

---

## 💰 Custos Mensais Estimados

- Firebase Hosting: **Grátis** (até 10GB)
- Cloud Run: **$5-15/mês** (tráfego baixo/médio)
- Firestore: **Grátis** (até 50K leituras/dia)

**Total:** ~$5-20/mês

---

## 🎯 Domínio Customizado (Opcional)

### Firebase Console:

1. Acesse: https://console.firebase.google.com
2. Projeto → Hosting
3. "Add custom domain"
4. Digite: `app.vingi.com.br`
5. Siga instruções de DNS

### Ou via CLI:

```bash
firebase hosting:sites:create vingi-app
firebase target:apply hosting vingi vingi-app
```

---

## ✅ Checklist Final

- [ ] Build frontend sem erros
- [ ] Backend deployado no Cloud Run
- [ ] OpenAI Key configurada
- [ ] URL do backend no frontend/.env
- [ ] Frontend deployado no Firebase
- [ ] Testado em produção
- [ ] Admin acessível (senha: v1ng1t3x)
- [ ] Chat funcionando com IA
- [ ] WhatsApp configurado

---

## 🔄 Re-deploy Rápido

### Apenas Frontend:

```bash
cd frontend
yarn build
cd ..
firebase deploy --only hosting
```

### Apenas Backend:

```bash
cd backend
gcloud run deploy vingi-backend --source . --region us-central1
```

### Tudo de uma vez:

```bash
./deploy.sh
```

---

**🎉 Sistema pronto para produção!**
