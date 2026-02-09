import { FaCheckCircle, FaWhatsapp } from 'react-icons/fa';

const OrderConfirmation = ({ onClose, orderNumber, deliveryType }) => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5511999999999';
  const lanchoneteWhatsApp = `https://wa.me/${whatsappNumber}`;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <FaCheckCircle className="mx-auto text-primary" size={80} />
        </div>
        
        <h2 className="text-2xl font-bold mb-3">Pedido Enviado!</h2>
        
        {orderNumber && (
          <div className="bg-primary text-white rounded-lg py-3 px-4 mb-4">
            <p className="text-sm font-medium">Número do Pedido</p>
            <p className="text-3xl font-bold">#{orderNumber}</p>
          </div>
        )}
        
        <div className="space-y-4 mb-6">
          <p className="text-textSecondary">
            Seu pedido foi enviado com sucesso para a lanchonete.
            {deliveryType === 'pickup' 
              ? ' Você será avisado pelo WhatsApp quando seu pedido estiver pronto para retirada.'
              : ' Em breve entraremos em contato via WhatsApp para confirmar.'}
          </p>
        </div>
        
        <div className="space-y-3">
          <a
            href={lanchoneteWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <FaWhatsapp size={20} />
            Falar no WhatsApp
          </a>
          
          <button
            onClick={onClose}
            className="btn-secondary w-full"
          >
            Fazer Novo Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
