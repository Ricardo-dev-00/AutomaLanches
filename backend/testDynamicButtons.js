import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function testWithStructureBuilding() {
  const message = `🍔 *TESTE COM ESTRUTURA DINÂMICA*

Testando construção de botões com if/else`;

  // Construir como está fazendo no servidor
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: '🍳 Pedido em preparo',
          url: 'https://wa.me/5598988888888?text=Teste%201'
        }
      ]
    ]
  };

  // Simular o if para retirada
  inlineKeyboard.inline_keyboard.push([
    {
      text: '🏪 Pronto para retirada',
      url: 'https://wa.me/5598988888888?text=Teste%202'
    }
  ]);

  console.log('\n🧪 TESTE COM ESTRUTURA DINÂMICA\n');
  console.log('Estrutura final:', JSON.stringify(inlineKeyboard, null, 2));
  console.log('\nEnviando...\n');

  try {
    const result = await bot.sendMessage(CHAT_ID, message, {
      parse_mode: 'Markdown',
      reply_markup: inlineKeyboard
    });
    console.log('✅ Mensagem enviada com SUCESSO!');
    console.log('Resultado:', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao enviar:', error);
    process.exit(1);
  }
}

testWithStructureBuilding();
