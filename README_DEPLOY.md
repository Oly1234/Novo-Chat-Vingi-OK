# 🚀 DEPLOY VINGI TÊXTIL - 3 PASSOS

## ✅ TUDO PRONTO! Arquivos criados:

- ✅ Todos os arquivos de configuração
- ✅ Dockerfile e Procfile
- ✅ Script de deploy automático
- ✅ Documentação completa

---

## 🎯 ESCOLHA SUA OPÇÃO:

### 🤖 Opção A: AUTOMÁTICO (Mais Fácil)

```bash
# 1. Abrir terminal no diretório do projeto
cd /caminho/para/vingi-complete

# 2. Executar script
./deploy.sh
```

**Pronto!** O script faz tudo sozinho! 🎉

---

### 👷 Opção B: MANUAL (Controle Total)

#### Passo 1: Build Frontend

```bash
cd frontend
yarn install
yarn build
cd ..
```

#### Passo 2: Deploy Backend

```bash
cd backend
gcloud run deploy vingi-backend --source . --platform managed --region us-central1 --allow-unauthenticated --set-env-vars ADMIN_PASSWORD=v1ng1t3x
```

**Copie a URL que aparece!**

#### Passo 3: Configurar OpenAI

```bash
gcloud run services update vingi-backend --region us-central1 --update-env-vars OPENAI_API_KEY=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
```

#### Passo 4: Atualizar Frontend

```bash
cd frontend
# Editar .env e colocar a URL do backend
nano .env
# Rebuild
yarn build
cd ..
```

#### Passo 5: Deploy Frontend

```bash
firebase deploy --only hosting
```

---

## 🆘 PROBLEMAS?

### "Permission denied: ./deploy.sh"

```bash
chmod +x deploy.sh
./deploy.sh
```

### "gcloud: command not found"

```bash
# Mac
brew install google-cloud-sdk

# Ou baixe: https://cloud.google.com/sdk/docs/install
```

### "firebase: command not found"

```bash
npm install -g firebase-tools
firebase login
```

### Build falhou

```bash
cd frontend
rm -rf node_modules build
yarn install
yarn build
```

---

## 📁 ARQUIVOS QUE VOCÊ TEM AGORA:

```
/
├── backend/
│   ├── Dockerfile ✅ NOVO
│   ├── Procfile ✅ NOVO
│   ├── .dockerignore ✅ NOVO
│   ├── .gcloudignore ✅ NOVO
│   └── ...
├── frontend/
│   ├── .env.template ✅ NOVO
│   └── ...
├── firebase.json ✅ NOVO
├── .firebaserc ✅ NOVO
├── deploy.sh ✅ NOVO (script automático)
├── DEPLOY_FINAL.md ✅ Guia completo
├── COMANDOS_SIMPLES.txt ✅ Cola de comandos
└── README_DEPLOY.md ✅ Este arquivo
```

---

## 🎉 URLs FINAIS

**Frontend:** https://vingi-textil.web.app
**Admin:** https://vingi-textil.web.app/admin
**Senha:** v1ng1t3x

---

## 💡 DICAS

1. **Use o script automático** (`./deploy.sh`) - é mais fácil!
2. **Guarde a URL do backend** que aparece no deploy
3. **Sempre faça backup do .env** antes de mudar
4. **Teste localmente** antes do deploy: `yarn start`

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Deploy feito
2. 🔧 Configure números WhatsApp no admin
3. 📝 Adicione conteúdo na Base de Conhecimento
4. 🌐 Configure domínio customizado (opcional)

---

**Qualquer dúvida, consulte:**
- `DEPLOY_FINAL.md` - Guia detalhado
- `COMANDOS_SIMPLES.txt` - Cola de comandos
- Ou execute: `./deploy.sh`

🚀 **Bom deploy!**
