# 🍔 AutomaLanches - Sistema de Pedidos Online

Sistema web profissional de pedidos online para lanchonetes, desenvolvido com foco **mobile-first**, integração automática com **Telegram Bot** para recebimento de pedidos e fluxo de pagamento **Pix** com confirmação manual via **WhatsApp**.

## 🎯 Características Principais

- ✅ **Design Mobile-First** - Interface otimizada para celulares
- ✅ **Cardápio por Categorias** - Hambúrgueres, Bebidas, Doces e Outros
- ✅ **Carrinho Inteligente** - Gerenciamento completo de itens
- ✅ **Entrega ou Retirada** - Cliente escolhe como receber
- ✅ **Múltiplas Formas de Pagamento** - Pix, Dinheiro ou Cartão
- ✅ **Integração Telegram** - Pedidos enviados automaticamente
- ✅ **Fluxo Pix Realista** - Comprovante via WhatsApp
- ✅ **Arquitetura Profissional** - Frontend e Backend separados

## 🚀 Tecnologias Utilizadas

### Frontend
- **React** - Biblioteca UI
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Estilização utility-first
- **Zustand** - Gerenciamento de estado
- **React Icons** - Ícones

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **node-telegram-bot-api** - Integração com Telegram
- **CORS** - Segurança de requisições
- **dotenv** - Variáveis de ambiente

## 📁 Estrutura do Projeto

```
automaLanches/
├── backend/
│   ├── server.js              # Servidor Express + Telegram Bot
│   ├── package.json
│   └── .env.example
├── src/
│   ├── components/
│   │   ├── Header.jsx         # Cabeçalho fixo
│   │   ├── Hero.jsx           # Banner principal
│   │   ├── CategoryFilter.jsx # Filtro de categorias
│   │   ├── ProductCard.jsx    # Card de produto
│   │   ├── ProductList.jsx    # Lista de produtos
│   │   ├── Cart.jsx           # Carrinho (drawer)
│   │   ├── CartButton.jsx     # Botão fixo do carrinho
│   │   ├── Checkout.jsx       # Formulário de checkout
│   │   ├── PixPayment.jsx     # Tela de pagamento Pix
│   │   └── OrderConfirmation.jsx # Confirmação do pedido
│   ├── data/
│   │   └── products.js        # Dados dos produtos
│   ├── services/
│   │   └── api.js             # Comunicação com backend
│   ├── store/
│   │   └── cartStore.js       # Zustand store
│   ├── App.jsx                # Componente principal
│   ├── main.jsx               # Entry point
│   └── index.css              # Estilos globais
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

## ⚙️ Configuração e Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd automaLanches
```

### 2. Configurar Frontend

```bash
# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env
```

Edite o arquivo `.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_WHATSAPP_NUMBER=5511999999999
VITE_PIX_KEY=suachavepix@email.com
VITE_LANCHONETE_NAME=AutomaLanches
```

### 3. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env
```

Edite o arquivo `backend/.env`:
```env
PORT=3001
TELEGRAM_BOT_TOKEN=seu_token_do_bot_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui
```

### 4. Criar Bot do Telegram

1. Abra o Telegram e procure por **@BotFather**
2. Digite `/newbot` e siga as instruções
3. Copie o **token** fornecido
4. Para obter o **CHAT_ID**:
   - Inicie uma conversa com seu bot
   - Acesse: `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`
   - Procure pelo campo `"chat":{"id":`

### 5. Executar o Projeto

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Acesse: http://localhost:5173

**Terminal 2 - Backend:**
```bash
cd backend
npm start
```
Rodando em: http://localhost:3001

## 🎨 Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Primary | `#25D366` | Botões principais, destaques |
| Secondary | `#128C7E` | Hover states |
| Background | `#FFFFFF` | Fundo da página |
| Card | `#F1F8F5` | Fundo de cards |
| Text Primary | `#1E1E1E` | Texto principal |
| Text Secondary | `#5F6368` | Texto secundário |

## 📱 Fluxo do Cliente

1. **Navegação** - Cliente visualiza produtos por categoria
2. **Seleção** - Adiciona produtos ao carrinho
3. **Carrinho** - Revisa itens e quantidades
4. **Tipo de Entrega** - Escolhe entre Entrega ou Retirada
5. **Dados** - Preenche informações pessoais e endereço
6. **Pagamento** - Seleciona forma de pagamento
7. **Pix** (se escolhido):
   - Visualiza chave Pix
   - Copia a chave
   - Realiza pagamento no banco
   - Envia comprovante via WhatsApp
8. **Confirmação** - Pedido enviado automaticamente ao Telegram

## 🔐 Segurança

- ✅ Variáveis de ambiente para dados sensíveis
- ✅ Tokens nunca expostos no frontend
- ✅ CORS configurado no backend
- ✅ `.gitignore` protegendo arquivos sensíveis

## 📦 Scripts Disponíveis

### Frontend
```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview da build
```

### Backend
```bash
npm start        # Produção
npm run dev      # Desenvolvimento com watch mode
```

## 🚀 Deploy

### Frontend (Vercel/Netlify)
1. Faça build: `npm run build`
2. Configure as variáveis de ambiente no painel
3. Deploy da pasta `dist/`

### Backend (Railway/Render/Heroku)
1. Configure as variáveis de ambiente
2. Deploy direto da pasta `backend/`
3. Certifique-se de que a porta está correta

## 🤖 Atualização de Status via Telegram Bot

Sistema inteligente de **atualização de status de pedidos** integrado ao Telegram, permitindo comunicação rápida e direta com o cliente via WhatsApp **sem custos com APIs pagas**.

### Como Funciona

1. **Pedido chega no Telegram** - Mensagem completa com todos os dados
2. **Botões interativos aparecem** - Logo abaixo da mensagem do pedido
3. **Atendente escolhe o status** - Clica no botão correspondente
4. **WhatsApp abre automaticamente** - Com mensagem já preenchida
5. **Apenas confirma o envio** - Cliente recebe atualização instantânea

### 🔘 Botões Disponíveis

Cada pedido possui **botões inline** (clicáveis) que se adaptam ao tipo de entrega:

#### Para Delivery 🚚
- **🍳 Pedido em preparo** - Avisa que o pedido foi recebido e está sendo preparado
- **🚴 Saiu para entrega** - Notifica que o entregador já saiu com o pedido

#### Para Retirada 🏪
- **🍳 Pedido em preparo** - Avisa que o pedido foi recebido e está sendo preparado
- **🏪 Pronto para retirada** - Notifica que o pedido está pronto para buscar

### 💬 Mensagens Automáticas

As mensagens são **personalizadas** com o nome do cliente e número do pedido:

**Pedido em preparo:**
```
Olá [Nome do Cliente]! 🍔

Seu pedido #[Número] foi recebido e já está em preparo.
Em breve avisaremos quando sair para entrega.

Obrigado pela preferência 🙏
```

**Saiu para entrega:**
```
Olá [Nome do Cliente]! 🚴‍♂️

Seu pedido #[Número] acabou de sair para entrega!
Em breve chegará até você.

Qualquer dúvida, estamos à disposição 😊
```

**Pronto para retirada:**
```
Olá [Nome do Cliente]! 🏪

Seu pedido #[Número] já está pronto para retirada.
Pode vir buscar quando quiser 😉

Obrigado!
```

### ✨ Vantagens

- ✅ **Zero custos com APIs** - Usa apenas Telegram Bot gratuito e WhatsApp Web
- ✅ **Comunicação direta** - Cliente recebe mensagem no WhatsApp dele
- ✅ **Mensagens prontas** - Economiza tempo do atendente
- ✅ **Personalizado** - Nome do cliente e número do pedido dinâmicos
- ✅ **Mobile-friendly** - Botões espaçados para evitar cliques acidentais
- ✅ **Profissional** - Melhora a experiência do cliente

### 📐 Design Responsivo

Os botões são exibidos **um por linha** para:
- Evitar cliques acidentais no celular
- Melhor legibilidade
- Espaço de toque confortável
- Interface limpa e organizada

## 🔮 Melhorias Futuras

- [ ] Painel administrativo
- [ ] Integração com API de pagamento Pix automático
- [ ] Sistema de autenticação
- [ ] Histórico de pedidos
- [ ] Notificações push
- [ ] Cupons de desconto
- [ ] Avaliações de produtos
- [ ] Sistema de fidelidade

## 📄 Licença

Este projeto é livre para uso pessoal e comercial.

## 👨‍💻 Desenvolvedor

Desenvolvido por **Ricardo** - Sistema completo de pedidos online para lanchonetes.

---

**🍔 Bom apetite e boas vendas!**
