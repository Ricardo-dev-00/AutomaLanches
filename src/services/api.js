// Em produção, usar URLs relativas (/api/...)
// Em desenvolvimento, pode usar localhost:3001
const API_URL = import.meta.env.VITE_API_URL || '';

export const sendOrderToTelegram = async (orderData) => {
  try {
    const url = API_URL ? `${API_URL}/api/send-order` : '/api/send-order';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API:', errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Erro ao enviar pedido:', error);
    throw error;
  }
};
