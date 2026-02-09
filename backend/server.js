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
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Arquivo para armazenar o contador de pedidos
const ORDER_COUNTER_FILE = path.join(__dirname, 'orderCounter.json');

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
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
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
    
    // Mensagem do pedido
    const message = `
🍔 *NOVO PEDIDO #${orderNumber}*

*Tipo:* ${deliveryTypeText}

*Cliente:* ${name}
📲 *WhatsApp:* ${whatsapp}

📦 *Itens:*
${itemsList}

💰 *Total:* R$ ${total.toFixed(2).replace('.', ',')}
${addressText}

💳 *Pagamento:* ${paymentMethodText}${paymentStatus}${changeText}
    `.trim();
    
    // Criar mensagens para WhatsApp (URL encoded) - CURTAS para não exceder limite de URL
    const msgEmPreparo = encodeURIComponent(
      `Olá ${name}!\n\nSeu pedido #${orderNumber} está em preparo. Em breve avisamos!\n\n👨‍🍳 #ReidaChapa`
    );
    
    const msgSaiuEntrega = encodeURIComponent(
      `Olá ${name}!\n\nSeu pedido #${orderNumber} saiu para entrega!\n\n🚴 Chegando em breve!`
    );
    
    const msgProntoRetirada = encodeURIComponent(
      `Olá ${name}!\n\nSeu pedido #${orderNumber} está pronto!\n\n🏪 Pode vir buscar agora!`
    );
    
    // Criar inline keyboard com botões de status
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: '🍳 Pedido em preparo',
            url: `https://wa.me/${whatsappSanitized}?text=${msgEmPreparo}`
          }
        ]
      ]
    };
    
    // Adicionar segundo botão de acordo com tipo de entrega
    if (deliveryType === 'delivery') {
      inlineKeyboard.inline_keyboard.push([
        {
          text: '🚴 Saiu para entrega',
          url: `https://wa.me/${whatsappSanitized}?text=${msgSaiuEntrega}`
        }
      ]);
    } else {
      inlineKeyboard.inline_keyboard.push([
        {
          text: '🏪 Pronto para retirada',
          url: `https://wa.me/${whatsappSanitized}?text=${msgProntoRetirada}`
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Telegram Bot configurado: ${process.env.TELEGRAM_BOT_TOKEN ? 'Sim' : 'Não'}`);
});
