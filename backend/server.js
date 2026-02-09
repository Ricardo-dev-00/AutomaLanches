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

dotenv.config();

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

// Função para gerar número do pedido único baseado em timestamp
function generateOrderNumber() {
  try {
    // Se o arquivo existe, usar o valor persistido + incrementar
    if (fs.existsSync(ORDER_COUNTER_FILE)) {
      const data = fs.readFileSync(ORDER_COUNTER_FILE, 'utf8');
      const { baseNumber } = JSON.parse(data);
      const currentNumber = baseNumber + 1;
      fs.writeFileSync(ORDER_COUNTER_FILE, JSON.stringify({ baseNumber: currentNumber }));
      return currentNumber;
    } else {
      // Primeira vez: usar timestamp como base (últimos 6 dígitos do timestamp + sequencial)
      const timestamp = Math.floor(Date.now() / 1000);
      const baseNumber = parseInt(String(timestamp).slice(-6)) * 100; // Espaço para 100 pedidos por segundo
      fs.writeFileSync(ORDER_COUNTER_FILE, JSON.stringify({ baseNumber }));
      return baseNumber;
    }
  } catch (error) {
    console.error('Erro ao gerar número do pedido:', error);
    // Fallback: gerar um número aleatório grande se tudo falhar
    return Math.floor(Math.random() * 900000) + 100000;
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

// Rota para enviar pedido ao Telegram
app.post('/api/send-order', async (req, res) => {
  try {
    const { deliveryType, name, whatsapp, street, number, neighborhood, reference, paymentMethod, items, total, needsChange, changeFor } = req.body;
    
    // Gerar número do pedido único
    const orderNumber = generateOrderNumber();
    
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
    
    // Enviar mensagem para o Telegram
    await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
    
    res.json({ 
      success: true, 
      message: 'Pedido enviado com sucesso!',
      orderNumber 
    });
    
  } catch (error) {
    console.error('Erro ao enviar pedido:', error);
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
