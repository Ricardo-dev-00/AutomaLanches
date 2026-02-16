// Sempre usar URL relativa em produção
// A URL será resolvida automaticamente baseada no domínio atual
const getApiUrl = () => {
  // Se estamos em localhost (desenvolvimento)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  // Em produção, usar URL relativa
  return '';
};

const API_URL = import.meta.env.VITE_API_URL || getApiUrl();

export const sendOrderToTelegram = async (orderData) => {
  try {
    const baseUrl = getApiUrl();
    const url = baseUrl ? `${baseUrl}/api/send-order` : '/api/send-order';
    console.log('📁 Enviando para:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      let errorMessage = 'Erro ao processar pedido.';

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }

      // Apenas log para estabelecimento fechado
      if (errorMessage.includes('Estamos fechados')) {
        console.info('ℹ️ Loja fechada:', errorMessage);
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Não logar erros conhecidos aqui (já logados acima)
    throw error;
  }
};
