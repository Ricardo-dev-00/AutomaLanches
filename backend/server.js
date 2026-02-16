import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { generatePixPayload } from './pixGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env do diretório backend
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || 'America/Fortaleza';
const WEEKDAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const BUSINESS_SCHEDULE = {
  0: { open: '18:00', close: '00:00' },
  1: { open: '18:00', close: '23:00' },
  2: { open: '18:00', close: '23:00' },
  3: { open: '18:00', close: '23:00' },
  4: { open: '18:00', close: '23:00' },
  5: { open: '18:00', close: '23:00' },
  6: { open: '18:00', close: '00:00' }
};

function toMinutes(timeString) {
  const [hour, minute] = timeString.split(':').map(Number);
  return (hour * 60) + minute;
}

function getZonedDateParts(timeZone) {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(new Date());
  const weekdayPart = parts.find(part => part.type === 'weekday')?.value?.toLowerCase().replace('.', '');
  const hour = Number(parts.find(part => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find(part => part.type === 'minute')?.value || 0);

  const weekdayMap = {
    dom: 0,
    seg: 1,
    ter: 2,
    qua: 3,
    qui: 4,
    sex: 5,
    sáb: 6,
    sab: 6
  };

  return {
    weekday: weekdayMap[weekdayPart] ?? new Date().getDay(),
    currentMinutes: (hour * 60) + minute
  };
}

function isBusinessOpen(schedule, timeZone) {
  // 1º) Verificar override manual para FORÇAR ABERTO
  if (process.env.FORCE_OPEN === 'true') {
    return true;
  }

  // 2º) Verificar override manual para FORÇAR FECHADO
  if (process.env.FORCE_CLOSED === 'true') {
    return false;
  }

  // 3º) Se não tem override, usar horário automático normal
  const { weekday, currentMinutes } = getZonedDateParts(timeZone);
  const todayWindow = schedule[weekday];

  if (!todayWindow) {
    return false;
  }

  const openMinutes = toMinutes(todayWindow.open);
  const closeMinutes = toMinutes(todayWindow.close);

  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  return false;
}

function getBusinessHoursText(schedule) {
  const sameWeekdayWindow = [1, 2, 3, 4, 5].every(day => {
    const config = schedule[day];
    return config && config.open === '18:00' && config.close === '23:00';
  });

  const sameWeekendWindow = [0, 6].every(day => {
    const config = schedule[day];
    return config && config.open === '18:00' && config.close === '00:00';
  });

  if (sameWeekdayWindow && sameWeekendWindow) {
    return 'Segunda a sexta: 18h às 23h | Sábado e domingo: 18h às 00h';
  }

  return Object.entries(schedule)
    .map(([day, config]) => `${WEEKDAY_NAMES[Number(day)]}: ${config.open} às ${config.close}`)
    .join(' | ');
}

// Middlewares - ordem importa para performance
app.use(compression()); // Comprimir respostas

// Configurar CORS permitindo o domínio do Railway e localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    // Permitir qualquer domínio do Railway (*.up.railway.app)
    if (origin.includes('.up.railway.app')) {
      return callback(null, true);
    }
    
    // Permitir origens específicas
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    callback(null, true); // Em produção, permitir todas as origens
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10kb' })); // Limitar tamanho do payload

// Cache headers para assets estáticos
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
});

// Inicializar bot do Telegram (opcional)
let bot = null;
let CHAT_ID = null;

if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
  try {
    // Ativar polling para receber callback_query (clicks nos botões)
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    console.log('✅ Telegram Bot inicializado com polling');
    
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
        const frontendBaseUrl = (process.env.FRONTEND_URL || 'https://automalanches-production.up.railway.app').replace(/\/$/, '');
        const repeatOrderLink = `${frontendBaseUrl}/?repeatOrder=${orderNumber}`;
        
        let messageText = '';
        if (status === 'preparo') {
          messageText = `🍳 *Em preparo*\n\nOlá, ${clientName}! 😊\n\nSeu pedido *#${orderNumber}* já está em preparo 🍳\nQuando sair para entrega, a gente te avisa aqui 😉\n\nQualquer dúvida, é só chamar!\n— AutomaLanches`;
        } else if (status === 'saiu_entrega') {
          messageText = `*Saiu para entrega!*\n\nOlá, ${clientName}! 👋\n\nSeu pedido *#${orderNumber}* já saiu para entrega\nEm breve ele chega até você! 🍔😋\n\nDesejamos uma ótima refeição!\n\nGostou do seu último pedido? 😍\nRepita agora mesmo com apenas um clique:\n📲 ${repeatOrderLink}\n\n— AutomaLanches`;
        } else if (status === 'pronto_retirada') {
          messageText = `🏪 *Pronto para retirada*\n\nOlá, ${clientName}! 🏪\n\nSeu pedido *#${orderNumber}* já está pronto para retirada!\nPode vir buscar quando quiser 😉\n\nGostou do seu último pedido? 😍\nRepita agora mesmo com apenas um clique:\n📲 ${repeatOrderLink}\n\nQualquer dúvida, é só chamar!\n— AutomaLanches`;
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
  } catch (error) {
    console.error('⚠️ Erro ao inicializar Telegram Bot:', error.message);
    console.log('⚠️ Servidor continuará sem integração Telegram');
  }
} else {
  console.log('⚠️ Telegram não configurado (TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID ausentes)');
}

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
function saveOrderData(orderNumber, whatsappSanitized, clientName, items = []) {
  try {
    const ordersData = loadOrdersData();
    ordersData[orderNumber] = {
      whatsapp: whatsappSanitized,
      name: clientName,
      items: items,
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync(ORDERS_DATA_FILE, JSON.stringify(ordersData, null, 2));
  } catch (error) {
    console.error('Erro ao salvar dados do pedido:', error);
  }
}

// Função para formatar data/hora com timezone correto
function formatDateTimeByTimezone(date, timezone) {
  try {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(date);
    const dateObj = {
      day: parts.find(p => p.type === 'day').value,
      month: parts.find(p => p.type === 'month').value,
      year: parts.find(p => p.type === 'year').value,
      hour: parts.find(p => p.type === 'hour').value,
      minute: parts.find(p => p.type === 'minute').value,
      second: parts.find(p => p.type === 'second').value
    };
    
    return {
      date: `${dateObj.day}/${dateObj.month}/${dateObj.year}`,
      time: `${dateObj.hour}:${dateObj.minute}:${dateObj.second}`
    };
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error);
    // Fallback para o método anterior em caso de erro
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR')
    };
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

// Health check para Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    telegram: bot ? 'configurado' : 'não configurado',
    timestamp: new Date().toISOString()
  });
});

// Rota de status da API (apenas para testes)
app.get('/api/status', (req, res) => {
  // Impedir cache para sempre pegar status atualizado
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  const isOpen = isBusinessOpen(BUSINESS_SCHEDULE, BUSINESS_TIMEZONE);
  const manualOverride = process.env.FORCE_OPEN === 'true' ? 'FORCE_OPEN' : 
                         process.env.FORCE_CLOSED === 'true' ? 'FORCE_CLOSED' : 
                         null;
  
  res.json({ 
    message: 'API AutomaLanches funcionando!',
    status: 'online',
    telegram: bot ? 'configurado' : 'não configurado',
    isOpen,
    manualOverride,
    businessHours: getBusinessHoursText(BUSINESS_SCHEDULE),
    timestamp: new Date().toISOString()
  });
});

// Rota para recuperar itens de um pedido anterior (para repetir pedido)
app.get('/api/order/:id', (req, res) => {
  try {
    const { id } = req.params;
    const ordersData = loadOrdersData();
    
    if (!ordersData[id]) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pedido não encontrado',
        error: 'ORDER_NOT_FOUND'
      });
    }
    
    const orderData = ordersData[id];
    
    // Validar se há itens salvos
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Itens do pedido não encontrados',
        error: 'ORDER_ITEMS_NOT_FOUND'
      });
    }
    
    res.json({ 
      success: true, 
      orderNumber: id,
      items: orderData.items
    });
  } catch (error) {
    console.error('Erro ao recuperar pedido:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao recuperar pedido',
      error: error.message 
    });
  }
});

// Rota para gerar código Pix
app.post('/api/generate-pix', (req, res) => {
  try {
    if (!isBusinessOpen(BUSINESS_SCHEDULE, BUSINESS_TIMEZONE)) {
      return res.status(403).json({
        success: false,
        message: `Estamos fechados no momento. Horário de funcionamento: ${getBusinessHoursText(BUSINESS_SCHEDULE)}.`,
        error: 'ESTABLISHMENT_CLOSED'
      });
    }

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
    if (!isBusinessOpen(BUSINESS_SCHEDULE, BUSINESS_TIMEZONE)) {
      return res.status(403).json({
        success: false,
        message: `Estamos fechados no momento. Horário de funcionamento: ${getBusinessHoursText(BUSINESS_SCHEDULE)}.`,
        error: 'ESTABLISHMENT_CLOSED'
      });
    }

    // Verificar se o Telegram está configurado
    if (!bot || !CHAT_ID) {
      return res.status(503).json({ 
        success: false, 
        message: 'Telegram não está configurado. Entre em contato pelo WhatsApp.',
        error: 'TELEGRAM_NOT_CONFIGURED'
      });
    }
    
    const { deliveryType, name, whatsapp, street, number, neighborhood, reference, paymentMethod, items, total, needsChange, changeFor } = req.body;
    
    // Sanitizar número de WhatsApp
    const whatsappSanitized = sanitizeWhatsAppNumber(whatsapp);
    
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
    
    // Formatar data/hora com timezone correto
    const orderDate = new Date();
    const { date: orderDateText, time: orderTimeText } = formatDateTimeByTimezone(orderDate, BUSINESS_TIMEZONE);

    // Mensagem do pedido - SEM ESPAÇOS INVISÍVEIS
    const message = 
      `🍔 *NOVO PEDIDO #${orderNumber}*\n\n` +
      `📆 ${orderDateText}\n` +
      `🕒 ${orderTimeText}\n\n` +
      `🚚 *Tipo:* ${deliveryTypeText}\n\n` +
      `👤 *Cliente:* ${name}\n` +
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
    
    // Adicionar botão para falar com o cliente via WhatsApp
    inlineKeyboard.inline_keyboard.push([
      {
        text: '📲 Falar com Cliente',
        url: `https://wa.me/${whatsappSanitized}`
      }
    ]);
    
    await bot.sendMessage(CHAT_ID, message, { 
      parse_mode: 'Markdown',
      reply_markup: inlineKeyboard
    });
    
    // Salvar dados do pedido para uso no callback_query (incluindo itens para repetição)
    saveOrderData(orderNumber, whatsappSanitized, name, items);
    
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

// Servir frontend buildado em produção (DEVE VIR DEPOIS DAS ROTAS DA API)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  console.log('📁 Diretório dist:', distPath);
  
  // Verificar se o diretório existe
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log('✅ Servindo frontend do dist/');
    
    // Rota catch-all para SPA
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('⚠️ Diretório dist/ não encontrado. Apenas API disponível.');
  }
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`🚀 Servidor AutomaLanches ONLINE`);
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Telegram: ${bot ? '✅ Configurado' : '⚠️ Não configurado'}`);
  console.log('='.repeat(50));
});

server.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});
