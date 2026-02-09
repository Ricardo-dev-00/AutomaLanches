const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const sendOrderToTelegram = async (orderData) => {
  try {
    console.log('🔗 Tentando conectar em:', API_URL);
    const response = await fetch(`${API_URL}/api/send-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    console.log('📡 Status da resposta:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API:', errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Dados recebidos:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao enviar pedido:', error);
    throw error;
  }
};
