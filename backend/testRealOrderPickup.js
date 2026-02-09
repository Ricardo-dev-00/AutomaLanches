import http from 'http';

const payload = {
  "deliveryType": "pickup",
  "name": "João Silva",
  "whatsapp": "(98) 98888-8888",
  "street": "",
  "number": "",
  "neighborhood": "",
  "reference": "",
  "paymentMethod": "dinheiro",
  "items": [
    {
      "id": 3,
      "name": "Hambúrguer Rei da Chapa",
      "price": 35,
      "quantity": 1,
      "observation": ""
    }
  ],
  "total": 35,
  "needsChange": false,
  "changeFor": ""
};

const jsonPayload = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/send-order',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': jsonPayload.length
  }
};

console.log('\n🚀 Enviando pedido como o frontend faz...\n');
console.log('Payload:', JSON.stringify(payload, null, 2));
console.log('\n---\n');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Resposta:', data);
    console.log('\n🔍 Verifique o Telegram para ver se os botões apareceram!\n');
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('❌ Erro na requisição:', e);
  process.exit(1);
});

req.write(jsonPayload);
req.end();
