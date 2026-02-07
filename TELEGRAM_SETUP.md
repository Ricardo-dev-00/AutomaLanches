# Como Configurar o Telegram Bot

## Passo 1: Criar o Bot

1. Abra o Telegram
2. Procure por **@BotFather**
3. Inicie uma conversa e digite: `/start`
4. Digite: `/newbot`
5. Escolha um nome para o bot (ex: "AutomaLanches Bot")
6. Escolha um username (deve terminar com 'bot', ex: "automalanches_bot")
7. Copie o **TOKEN** fornecido

## Passo 2: Obter o Chat ID

### Método 1: Usando o próprio chat
1. Inicie uma conversa com seu bot
2. Envie qualquer mensagem
3. Acesse no navegador:
   ```
   https://api.telegram.org/bot<SEU_TOKEN>/getUpdates
   ```
4. Procure por `"chat":{"id":` - esse é seu CHAT_ID

### Método 2: Usando um grupo
1. Crie um grupo no Telegram
2. Adicione seu bot ao grupo
3. Envie uma mensagem no grupo
4. Acesse a URL acima
5. Procure pelo ID do grupo (número negativo)

## Passo 3: Configurar o .env

Edite o arquivo `backend/.env`:

```env
PORT=3001
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=987654321
```

## Passo 4: Testar

1. Inicie o servidor backend
2. Faça um pedido pelo sistema
3. Verifique se a mensagem chegou no Telegram

## Exemplo de Mensagem Recebida

```
🍔 NOVO PEDIDO

Tipo: 🚚 Entrega

Cliente: João Silva
📲 WhatsApp: 11999999999

📦 Itens:
• X-Burger Clássico (2x) - R$ 51,80
• Coca-Cola Lata (1x) - R$ 5,00

💰 Total: R$ 56,80

📍 Endereço:
Rua das Flores, 123
Bairro: Centro
Ref: Próximo à praça

💳 Pagamento: 💳 Pix
⏳ Status: Aguardando comprovante
```

## Solução de Problemas

### Bot não recebe mensagens
- Verifique se o TOKEN está correto
- Certifique-se de que iniciou uma conversa com o bot
- Verifique se o CHAT_ID está correto

### Erro 401 Unauthorized
- TOKEN incorreto ou inválido
- Regenere o token com @BotFather usando `/token`

### Mensagem não chega
- Verifique se o backend está rodando
- Verifique os logs do servidor
- Teste a conexão com: `/getMe` na API do Telegram

## Recursos Úteis

- Documentação oficial: https://core.telegram.org/bots
- Bot API: https://core.telegram.org/bots/api
- BotFather commands: `/help`
