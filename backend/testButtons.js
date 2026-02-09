import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const message = `🧪 *TESTE DE BOTÕES*

Este é um teste para verificar se os botões inline estão funcionando.`;

const inlineKeyboard = {
  inline_keyboard: [
    [
      {
        text: '🍳 Pedido em preparo',
        url: 'https://wa.me/5598988888888?text=Ol%C3%A1!%20Teste%20de%20bot%C3%A3o'
      }
    ],
    [
      {
        text: '🚴 Saiu para entrega',
        url: 'https://wa.me/5598988888888?text=Ol%C3%A1!%20Teste%202'
      }
    ]
  ]
};

console.log('Enviando mensagem de teste com botões...');
console.log('Estrutura dos botões:', JSON.stringify(inlineKeyboard, null, 2));

bot.sendMessage(CHAT_ID, message, { 
  parse_mode: 'Markdown',
  reply_markup: inlineKeyboard
})
.then(() => {
  console.log('✅ Mensagem enviada com sucesso!');
  console.log('Verifique seu Telegram. Os botões devem aparecer logo abaixo da mensagem.');
  process.exit(0);
})
.catch((error) => {
  console.error('❌ Erro ao enviar mensagem:', error);
  process.exit(1);
});
