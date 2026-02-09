import http from 'http';

const testOrder = {
  deliveryType: 'pickup',
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
      quantity: 1
    }
  ],
  total: 25.00,
  needsChange: false,
  changeFor: ''
};

const jsonString = JSON.stringify(testOrder);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/send-order',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': jsonString.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('\n✅ Resposta recebida:', data);
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e);
});

console.log('\n🧪 Enviando pedido de teste...\n');
req.write(jsonString);
req.end();
