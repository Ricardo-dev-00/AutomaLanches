import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testOrderWithButtons() {
  const testOrder = {
    deliveryType: 'pickup', // Testando com retirada
    name: 'João Silva',
    whatsapp: '(98) 98888-8888',
    street: '',
    number: '',
    neighborhood: '',
    reference: '',
    paymentMethod: 'dinheiro',
    items: [
      {
        id: 1,
        name: 'Hambúrguer Rei',
        price: 25.00,
        quantity: 1,
        observation: 'Sem cebola'
      }
    ],
    total: 25.00,
    needsChange: false,
    changeFor: ''
  };

  console.log('\n🧪 TESTE DE PEDIDO COM BOTÕES\n');
  console.log('Enviando pedido:', JSON.stringify(testOrder, null, 2));

  try {
    const response = await fetch(`${API_URL}/api/send-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder)
    });

    const result = await response.json();
    console.log('\n✅ Resposta do servidor:', result);
    console.log('\n📱 Verifique seu Telegram! Os botões devem aparecer.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

testOrderWithButtons();
