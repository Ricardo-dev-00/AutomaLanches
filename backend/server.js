import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { generatePixPayload } from './pixGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env do diretório backend
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializar bot do Telegram
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Arquivo para armazenar o contador de pedidos
const ORDER_COUNTER_FILE = path.join(__dirname, 'orderCounter.json');

// Arquivo para armazenar dados dos pedidos (para callbacks)
const ORDERS_DATA_FILE = path.join(__dirname, 'ordersData.json');

// Função para carregar dados dos pedidos
function loadOrdersData() {
  try {
    if (fs.existsSync(ORDERS_DATA_FILE)) {
      const data = fs.readFileSync(ORDERS_DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar dados dos pedidos:', error);
  }
  return {};
}

// Função para salvar dados do pedido
function saveOrderData(orderNumber, whatsappSanitized, clientName) {
  try {
    const ordersData = loadOrdersData();
    ordersData[orderNumber] = {
      whatsapp: whatsappSanitized,
      name: clientName,
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync(ORDERS_DATA_FILE, JSON.stringify(ordersData, null, 2));
  } catch (error) {
    console.error('Erro ao salvar dados do pedido:', error);
  }
}

// Função para gerar número do pedido único (contador simples começando do 1)
function generateOrderNumber() {
  try {
    if (fs.existsSync(ORDER_COUNTER_FILE)) {
      const data = fs.readFileSync(ORDER_COUNTER_FILE, 'utf8');
      let { currentNumber } = JSON.parse(data);
      currentNumber = currentNumber + 1;
      fs.writeFileSync(ORDER_COUNTER_FILE, JSON.stringify({ currentNumber }));
      return currentNumber;
    } else {
      // Primeira execução: começar do 1
      fs.writeFileSync(ORDER_COUNTER_FILE, JSON.stringify({ currentNumber: 1 }));
      return 1;
    }
  } catch (error) {
    console.error('Erro ao gerar número do pedido:', error);
    return Math.floor(Math.random() * 9000) + 1000;
  }
}

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API AutomaLanches funcionando!' });
});

// Rota para gerar código Pix
app.post('/api/generate-pix', (req, res) => {
  try {
    const { value } = req.body;
    
    const pixKey = process.env.PIX_KEY || 'suachavepix@email.com';
    const merchantName = process.env.MERCHANT_NAME || 'AutomaLanches';
    const merchantCity = process.env.MERCHANT_CITY || 'Sao Luis';
    
    const pixCode = generatePixPayload(pixKey, value, merchantName, merchantCity);
    
    res.json({ 
      success: true, 
      pixCode,
      pixKey 
    });
  } catch (error) {
    console.error('Erro ao gerar Pix:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao gerar código Pix',
      error: error.message 
    });
  }
});

// Função para sanitizar número de WhatsApp
function sanitizeWhatsAppNumber(phone) {
  // Remove espaços e caracteres especiais
  let cleaned = phone.trim().replace(/\D/g, '');
  
  // Se começar com 0, remove
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Se não tiver código do país (55), adiciona
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  
  return cleaned;
}

// Rota para enviar pedido ao Telegram
app.post('/api/send-order', async (req, res) => {
  try {
    console.log('PEDIDO RECEBIDO');
    const { deliveryType, name, whatsapp, street, number, neighborhood, reference, paymentMethod, items, total, needsChange, changeFor } = req.body;
    
    // Sanitizar número de WhatsApp
    const whatsappSanitized = sanitizeWhatsAppNumber(whatsapp);
    console.log('WHATSAPP SANITIZADO:', whatsappSanitized);
    
    // Gerar número do pedido único
    const orderNumber = generateOrderNumber();
    console.log('NUMERO DO PEDIDO:', orderNumber);
    
    // Formatar lista de itens
    const itemsList = items.map(item => {
      const itemText = `• ${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}`;
      return item.observation ? `${itemText}\n  📝 ${item.observation}` : itemText;
    }).join('\n');
    
    // Formatar tipo de entrega
    const deliveryTypeText = deliveryType === 'delivery' ? '🚚 Entrega' : '🏪 Retirada no local';
    
    // Formatar endereço (apenas para entrega)
    const addressText = deliveryType === 'delivery' 
      ? `\n📍 *Endereço:*\nRua: ${street}\nNúmero: ${number}\nBairro: ${neighborhood}${reference ? `\nComplemento: ${reference}` : ''}`
      : '';
    
    // Formatar método de pagamento
    const paymentMethodText = {
      'pix': '💳 Pix',
      'dinheiro': '💵 Dinheiro',
      'cartao': '💳 Débito ou Crédito'
    }[paymentMethod];
    
    const paymentStatus = paymentMethod === 'pix' 
      ? '\n⏳ Status: Aguardando comprovante' 
      : '';
    
    // Formatar informação de troco
    let changeText = '';
    if (paymentMethod === 'dinheiro') {
      if (needsChange && changeFor) {
        // Calcular o troco
        const changeValue = parseFloat(changeFor.replace('R$', '').replace(/\./g, '').replace(',', '.'));
        const changeAmount = changeValue - total;
        const changeFormatted = changeAmount > 0 
          ? changeAmount.toFixed(2).replace('.', ',')
          : '0,00';
        
        changeText = `\n💵 *Pagará com:* ${changeFor}\n💰 *Troco a devolver:* R$ ${changeFormatted}`;
      } else if (!needsChange) {
        changeText = '\n✅ Não precisa de troco';
      }
    }
    
    // Mensagem do pedido - SEM ESPAÇOS INVISÍVEIS
    const message = 
      `🍔 *NOVO PEDIDO #${orderNumber}*\n\n` +
      `*Tipo:* ${deliveryTypeText}\n\n` +
      `*Cliente:* ${name}\n` +
      `📲 *WhatsApp:* ${whatsapp}\n\n` +
      `📦 *Itens:*\n` +
      `${itemsList}\n\n` +
      `💰 *Total:* R$ ${total.toFixed(2).replace('.', ',')}\n` +
      (addressText ? `${addressText}\n\n` : '') +
      `💳 *Pagamento:* ${paymentMethodText}${paymentStatus}${changeText}`;
    
    // Criar inline keyboard com botões de status (usando callback_data)
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: '🍳 Pedido em preparo',
            callback_data: `preparo_${orderNumber}`
          }
        ]
      ]
    };
    
    // Adicionar segundo botão de acordo com tipo de entrega
    if (deliveryType === 'delivery') {
      inlineKeyboard.inline_keyboard.push([
        {
          text: '🚴 Saiu para entrega',
          callback_data: `saiu_entrega_${orderNumber}`
        }
      ]);
    } else {
      inlineKeyboard.inline_keyboard.push([
        {
          text: '🏪 Pronto para retirada',
          callback_data: `pronto_retirada_${orderNumber}`
        }
      ]);
    }
    
    console.log('BOTOES OK');
    console.log('TIPO:', deliveryType);
    console.log('ENVIANDO...');
    console.log('CHAT_ID:', CHAT_ID);
    console.log('BOT_TOKEN_EXISTS:', !!process.env.TELEGRAM_BOT_TOKEN);
    
    await bot.sendMessage(CHAT_ID, message, { 
      parse_mode: 'Markdown',
      reply_markup: inlineKeyboard
    });
    
    // Salvar dados do pedido para uso no callback_query
    saveOrderData(orderNumber, whatsappSanitized, name);
    
    console.log('✅ PEDIDO ENVIADO COM SUCESSO');
    
    res.json({ 
      success: true, 
      message: 'Pedido enviado com sucesso!',
      orderNumber 
    });
    
  } catch (error) {
    console.error('❌ ERRO COMPLETO:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao enviar pedido',
      error: error.message 
    });
  }
});

// Listener para callback_query (quando clica nos botões)
bot.on('callback_query', async (query) => {
  try {
    const chatId = query.message.chat.id;
    const callbackData = query.data;
    
    // Extrair status e número do pedido
    let status = '';
    let orderNumber = '';
    
    if (callbackData.startsWith('preparo_')) {
      status = 'preparo';
      orderNumber = callbackData.replace('preparo_', '');
    } else if (callbackData.startsWith('saiu_entrega_')) {
      status = 'saiu_entrega';
      orderNumber = callbackData.replace('saiu_entrega_', '');
    } else if (callbackData.startsWith('pronto_retirada_')) {
      status = 'pronto_retirada';
      orderNumber = callbackData.replace('pronto_retirada_', '');
    }
    
    // Carregar dados do pedido
    const ordersData = loadOrdersData();
    const orderData = ordersData[orderNumber];
    
    if (!orderData) {
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Pedido não encontrado!',
        show_alert: true
      });
      return;
    }
    
    const whatsappSanitized = orderData.whatsapp;
    const clientName = orderData.name || 'Cliente';
    
    // Responder ao callback query
    await bot.answerCallbackQuery(query.id, {
      text: '✅ Status atualizado!',
      show_alert: false
    });
    
    // Definir mensagem conforme o status
    let messageText = '';
    if (status === 'preparo') {
      messageText = `🍳 *Em preparo*\n\nOlá, ${clientName}! 😊\n\nSeu pedido *#${orderNumber}* já está em preparo 🍳\nQuando sair para entrega, a gente te avisa aqui 😉\n\nQualquer dúvida, é só chamar!\n— Rei da Chapa`;
    } else if (status === 'saiu_entrega') {
      messageText = `🚴 *Saiu para entrega*\n\nOlá, ${clientName}! 🚴\n\nSeu pedido *#${orderNumber}* já saiu para entrega\nEm breve ele chega até você!\n\nQualquer dúvida, é só chamar 😉\n— Rei da Chapa`;
    } else if (status === 'pronto_retirada') {
      messageText = `🏪 *Pronto para retirada*\n\nOlá, ${clientName}! 🏪\n\nSeu pedido *#${orderNumber}* já está pronto para retirada!\nPode vir buscar quando quiser 😉\n\nQualquer dúvida, é só chamar!\n— Rei da Chapa`;
    }
    
    // Enviar mensagem com botão do WhatsApp
    await bot.sendMessage(chatId, messageText, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📲 Abrir WhatsApp do cliente',
              url: `https://wa.me/${whatsappSanitized}`
            }
          ]
        ]
      }
    });
    
  } catch (error) {
    console.error('Erro no callback_query:', error);
    await bot.answerCallbackQuery(query.id, {
      text: '❌ Erro ao processar!',
      show_alert: true
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Telegram Bot configurado: ${process.env.TELEGRAM_BOT_TOKEN ? 'Sim' : 'Não'}`);
});
