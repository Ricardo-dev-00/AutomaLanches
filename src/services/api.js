const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const sendOrderToTelegram = async (orderData) => {
  try {
    const response = await fetch(`${API_URL}/api/send-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao enviar pedido');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar pedido:', error);
    throw error;
  }
};
