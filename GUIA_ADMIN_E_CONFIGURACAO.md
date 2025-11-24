# 🔐 Guia de Administração e Configuração - Vingi Têxtil

## 📍 **1. ACESSO AO PAINEL ADMIN**

### Opção 1: URL Direta (RECOMENDADO)
```
https://atendeonline.preview.emergentagent.com/admin
```
**Simplesmente digite /admin na URL**

### Opção 2: Botão Discreto
- Localização: Canto inferior direito da página inicial
- Ícone: Escudo (🛡️)
- Opacidade: 30% (aumenta para 100% no hover)
- **Caso não veja**: Use a Opção 1 (URL direta)

---

## 🔑 **2. COMO CONFIGURAR SUA SENHA DE ADMIN**

### Senha Atual (Padrão):
```
v1ng1t3x
```

### Como Trocar a Senha:

#### Passo 1: Editar o arquivo .env
```bash
nano /app/backend/.env
```

#### Passo 2: Localizar e modificar
```bash
# Linha 12
ADMIN_PASSWORD=v1ng1t3x   # ← Trocar por sua senha
```

#### Passo 3: Salvar e reiniciar
```bash
# Salvar: Ctrl+O, Enter, Ctrl+X
sudo supervisorctl restart backend
```

### ⚠️ **IMPORTANTE - Segurança**:
- Use senha forte (mín. 12 caracteres)
- Misture maiúsculas, minúsculas, números e símbolos
- Exemplo: `Vingi@2024#Seguro!`
- NÃO compartilhe a senha
- Troque periodicamente

---

## 🤖 **3. SOBRE A IA E API KEYS**

### ✅ IA Já Está Funcional!

**Resposta Curta**: SIM, a IA já funciona! Não precisa configurar nada no deploy.

### Como Funciona:

#### OpenAI Key Atual:
```bash
# Arquivo: /app/backend/.env
OPENAI_API_KEY=sk-proj-FepzYkNPDO-RdfWAhDN7s89x01q...
```

**Esta key JÁ ESTÁ CONFIGURADA e FUNCIONANDO!**

### ⚠️ Quando Trocar a Key:

#### Cenário 1: Key Expirou
- Sintoma: Chat para de responder, erro "401 Unauthorized"
- Solução: Obter nova key da OpenAI

#### Cenário 2: Limite de Uso Atingido
- Sintoma: Erro "Rate limit exceeded" ou "Quota exceeded"
- Solução: Atualizar plano OpenAI ou usar nova key

#### Cenário 3: Deploy em Produção
- Recomendação: Usar sua própria key da OpenAI
- Motivo: Segurança e controle de custos

### Como Obter Nova OpenAI Key:

1. Acesse: https://platform.openai.com/api-keys
2. Faça login (ou crie conta)
3. Clique em "Create new secret key"
4. Copie a key (começa com `sk-proj-...`)
5. Cole no `/app/backend/.env`
6. Reinicie: `sudo supervisorctl restart backend`

### Custo OpenAI (Referência):
- Modelo: GPT-4o-mini
- Custo: ~$0.15 por 1M tokens de entrada
- Estimativa: ~1000 conversas = $1-2
- **Muito barato para uso normal**

---

## 🚀 **4. DEPLOY EM PRODUÇÃO**

### Checklist de Segurança:

#### ✅ Antes do Deploy:
1. [ ] Trocar `ADMIN_PASSWORD` para senha forte
2. [ ] Configurar sua própria `OPENAI_API_KEY`
3. [ ] Atualizar `MONGO_URL` para MongoDB produção
4. [ ] Configurar domínio em `REACT_APP_BACKEND_URL`
5. [ ] Adicionar SSL/HTTPS
6. [ ] Configurar backup do MongoDB
7. [ ] Testar todas as funcionalidades

#### ✅ Segurança Extra:
- [ ] Implementar rate limiting global
- [ ] Adicionar logs de acesso admin
- [ ] Configurar alertas de segurança
- [ ] Considerar 2FA para admin
- [ ] Usar Redis para login attempts (produção)

---

## 📝 **5. CONFIGURAÇÕES IMPORTANTES**

### Arquivo: `/app/backend/.env`

```bash
# Database
MONGO_URL=mongodb://localhost:27017/
DB_NAME=vingi

# OpenAI (IA do Chat)
OPENAI_API_KEY=sk-proj-xxx  # ← Sua key aqui

# Admin (Senha de Acesso)
ADMIN_PASSWORD=v1ng1t3x     # ← Trocar aqui

# CORS (Deploy)
CORS_ORIGINS=*              # ← Em produção: seu domínio
```

### Arquivo: `/app/frontend/.env`

```bash
# Backend URL (Deploy)
REACT_APP_BACKEND_URL=https://atendeonline.preview.emergentagent.com

# Em produção, trocar para seu domínio:
# REACT_APP_BACKEND_URL=https://api.seudominio.com
```

---

## 🔧 **6. COMANDOS ÚTEIS**

### Reiniciar Serviços:
```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
sudo supervisorctl restart all
```

### Ver Logs:
```bash
# Backend
tail -f /var/log/supervisor/backend.*.log

# Frontend
tail -f /var/log/supervisor/frontend.*.log

# Ver últimas 50 linhas
tail -n 50 /var/log/supervisor/backend.*.log
```

### Verificar Status:
```bash
sudo supervisorctl status
```

### Editar Arquivos:
```bash
# Usar nano (mais fácil)
nano /app/backend/.env

# Ou vim
vim /app/backend/.env
```

---

## 🆘 **7. SOLUÇÃO DE PROBLEMAS**

### Problema: "Não consigo acessar o admin"
**Solução**:
1. Tente URL direta: `/admin`
2. Limpe cache do navegador (Ctrl+Shift+Del)
3. Tente navegação anônima
4. Verifique se backend está rodando: `sudo supervisorctl status`

### Problema: "Senha não funciona"
**Solução**:
1. Verifique o `.env`: `cat /app/backend/.env | grep ADMIN_PASSWORD`
2. Sem espaços extras na senha
3. Reinicie backend: `sudo supervisorctl restart backend`
4. Tente senha padrão: `v1ng1t3x`

### Problema: "IA não responde"
**Solução**:
1. Verifique key: `cat /app/backend/.env | grep OPENAI_API_KEY`
2. Key começa com `sk-proj-` ou `sk-`?
3. Teste no chat: pergunte algo
4. Ver logs: `tail -f /var/log/supervisor/backend.*.log`
5. Se erro 401: Key inválida/expirada

### Problema: "Bloqueado após 3 tentativas"
**Solução**:
1. Aguarde 30 minutos OU
2. Limpe localStorage do navegador:
   - Abra DevTools (F12)
   - Application → Local Storage
   - Delete `adminLockData`
3. Ou use navegação anônima

---

## 📊 **8. MONITORAMENTO**

### KPIs Importantes:
- Total de conversas (Analytics → Dashboard)
- Avaliação média (Analytics → Estrelas)
- Taxa de conversão VAGAS (Candidatos cadastrados)
- Tempo médio de resposta (< 3s)

### Exportar Relatórios:
1. Login no admin
2. Aba "Analytics"
3. Botão "Exportar Sessões" → CSV
4. Botão "Exportar Candidatos" → CSV

### Backup Recomendado:
```bash
# Backup MongoDB (semanal)
mongodump --db vingi --out /backups/$(date +%Y%m%d)

# Backup .env (sempre)
cp /app/backend/.env /app/backend/.env.backup
```

---

## 🎯 **9. RESUMO RÁPIDO**

### Para Começar Agora:
1. **Acesso Admin**: `/admin` na URL
2. **Senha**: `v1ng1t3x` (trocar depois)
3. **IA**: Já funciona! Nada a fazer
4. **Deploy**: Trocar senha e OpenAI key

### Trocar Senha (3 passos):
1. `nano /app/backend/.env`
2. Linha 12: `ADMIN_PASSWORD=SuaNovaSenha`
3. `sudo supervisorctl restart backend`

### Trocar OpenAI Key (se necessário):
1. Obter em: platform.openai.com/api-keys
2. `nano /app/backend/.env`
3. Linha 9: `OPENAI_API_KEY=sk-proj-xxx`
4. `sudo supervisorctl restart backend`

---

## ✅ **10. CHECKLIST FINAL**

Antes de entregar/usar em produção:

- [ ] Testei acesso admin (`/admin`)
- [ ] Senha do admin trocada
- [ ] OpenAI key própria configurada (produção)
- [ ] MongoDB de produção configurado
- [ ] Domínio próprio configurado
- [ ] SSL/HTTPS ativado
- [ ] Backup configurado
- [ ] Testei todas as funcionalidades
- [ ] Knowledge Base populada (12 categorias)
- [ ] WhatsApp numbers configurados
- [ ] Candidate workflow testado

---

## 📞 **SUPORTE**

### Dúvidas Técnicas:
- Documentação completa: `/app/README_SISTEMA_COMPLETO.md`
- Funcionalidades: `/app/FUNCIONALIDADES_COMPLETAS.md`

### Logs Importantes:
```bash
# Ver todos os logs
tail -f /var/log/supervisor/*.log

# Apenas erros
grep -i error /var/log/supervisor/backend.*.log
```

---

**Sistema Vingi Têxtil - 100% Operacional**  
*Desenvolvido com ❤️ para excelência em atendimento*
