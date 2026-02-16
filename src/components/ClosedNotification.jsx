import { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';

const ClosedNotification = ({ message, businessHours, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slideUp">
        {/* Header com ícone */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 p-4 rounded-full">
              <FaClock size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Loja Fechada</h2>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 text-center text-lg font-medium">
            Desculpe, estamos fechados no momento.
          </p>

          {/* Horários */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900 text-center mb-3">
              ⏰ Horário de Funcionamento
            </p>
            <div className="space-y-2 text-center">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Segunda a Sexta</span>
                <br />
                18h às 23h
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Sábado e Domingo</span>
                <br />
                18h às 00h
              </p>
            </div>
          </div>

          {/* Mensagem motivacional */}
          <p className="text-center text-sm text-gray-600">
            Volte nos nossos horários de funcionamento para fazer seu pedido! 🍔
          </p>
        </div>

        {/* Footer com botão */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleDismiss}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Entendi, obrigado!
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ClosedNotification;
