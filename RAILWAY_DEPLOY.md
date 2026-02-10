# Deploy no Railway - AutomaLanches

## 🚀 Guia de Deploy

### Configurações Necessárias no Railway

1. **Variáveis de Ambiente**
   
   No painel do Railway, vá em **Variables** e adicione:
   
   ```
   NODE_ENV=production
   PORT=3001
   TELEGRAM_BOT_TOKEN=seu_token_aqui
   TELEGRAM_CHAT_ID=seu_chat_id_aqui
   PIX_KEY=sua_chave_pix
   MERCHANT_NAME=Nome da sua lanchonete
   MERCHANT_CITY=Sua cidade
   ```

2. **Configuração do Deploy**
   
   - O Railway detectará automaticamente o `nixpacks.toml`
   - O build será feito automaticamente usando o comando `npm start`
   - O servidor irá rodar na porta definida pela variável `PORT`

### 📋 Checklist Antes do Deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Token do Telegram configurado e bot criado
- [ ] Chave PIX configurada
- [ ] Repositório conectado ao Railway

### 🔧 Comandos Importantes

Se precisar fazer deploy manual:

```bash
# Fazer commit das alterações
git add .
git commit -m "Configurar para Railway"
git push

# O Railway detectará automaticamente e fará o deploy
```

### 🐛 Solução de Problemas

#### Erro: "Application failed to respond"

**Causas comuns:**
1. Variáveis de ambiente não configuradas
2. PORT não está sendo lida corretamente
3. Build falhou

**Soluções:**
1. Verifique os logs no Railway Dashboard
2. Certifique-se que todas as variáveis estão configuradas
3. Verifique se o `NODE_ENV=production` está definido
4. Verifique se o Telegram Bot Token está correto

#### Como ver os logs:

1. Acesse o Dashboard do Railway
2. Clique no seu projeto
3. Vá em **Deployments**
4. Clique no deploy mais recente
5. Veja os logs de Build e Deploy

### 📡 Testando o Deploy

Após o deploy bem-sucedido:

1. Acesse a URL fornecida pelo Railway (exemplo: `https://seu-app.up.railway.app`)
2. Você deve ver a página inicial da aplicação
3. Tente fazer um pedido teste
4. Verifique se a mensagem chegou no Telegram

### 🔄 Redeploy

Para fazer um novo deploy:

```bash
git add .
git commit -m "Sua mensagem"
git push
```

O Railway irá automaticamente detectar as mudanças e fazer o redeploy.

### 📝 Notas Importantes

- O Railway automaticamente atribui uma URL pública para sua aplicação
- O servidor serve tanto o backend (API) quanto o frontend (React buildado)
- Em produção, o CORS está configurado para aceitar qualquer domínio `.up.railway.app`
- Os arquivos de pedidos (`orderCounter.json` e `ordersData.json`) são persistidos no sistema de arquivos

### 🆘 Precisa de Ajuda?

Se continuar com problemas:

1. Verifique os logs completos no Railway
2. Teste localmente com: `npm start`
3. Verifique se o build funciona: `npm run build`
4. Entre em contato com o suporte do Railway

## ✅ Deploy Concluído!

Sua aplicação está rodando em produção! 🎉
