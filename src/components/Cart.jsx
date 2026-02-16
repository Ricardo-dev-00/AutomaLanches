import { useEffect, useState } from 'react';
import { FaTimes, FaPlus, FaMinus, FaTrash, FaMotorcycle, FaStore } from 'react-icons/fa';
import useCartStore from '../store/cartStore';
import { fetchStatus } from '../services/api';

const Cart = ({ onCheckout }) => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    updateObservation,
    deliveryType,
    deliveryFee,
    setDeliveryType,
    getTotal,
    getTotalWithDelivery
  } = useCartStore();
  
  const subtotal = getTotal();
  const total = getTotalWithDelivery();
  const minimumOrder = 20;
  const isMinimumMet = subtotal >= minimumOrder;
  const [statusLoading, setStatusLoading] = useState(false);
  const [businessStatus, setBusinessStatus] = useState({
    isOpen: null,
    businessHours: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    let intervalId = null;

    const loadStatus = async () => {
      setStatusLoading(true);
      const data = await fetchStatus();
      if (isMounted && data) {
        setBusinessStatus({
          isOpen: data.isOpen,
          businessHours: data.businessHours
        });
      }
      if (isMounted) {
        setStatusLoading(false);
      }
    };

    loadStatus();
    intervalId = setInterval(loadStatus, 60000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={closeCart}
      />
      
      {/* Drawer do Carrinho */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Meu Carrinho</h2>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                statusLoading || businessStatus.isOpen === null
                  ? 'bg-gray-100 text-gray-600'
                  : businessStatus.isOpen
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
              }`}
            >
              {statusLoading
                ? 'Verificando...'
                : businessStatus.isOpen === null
                  ? 'Status indisponível'
                  : businessStatus.isOpen
                    ? 'Aberto agora'
                    : 'Fechado agora'}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fechar carrinho"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {businessStatus.businessHours && (
          <div className="px-4 py-2 text-xs text-textSecondary bg-gray-50 border-b">
            Horário: {businessStatus.businessHours}
          </div>
        )}
        
        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-lg text-textSecondary">Seu carrinho está vazio</p>
              <p className="text-sm text-textSecondary mt-2">Adicione produtos para continuar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 bg-card p-3 rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                    <p className="text-primary font-bold text-sm mb-2">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>
                    
                    {/* Controles de Quantidade */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-white border border-gray-300 p-1 rounded hover:bg-gray-100"
                        aria-label="Diminuir quantidade"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="bg-primary text-white p-1 rounded hover:bg-secondary"
                        aria-label="Aumentar quantidade"
                      >
                        <FaPlus size={10} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-red-500 hover:text-red-700 p-1"
                        aria-label="Remover item"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                    
                    {/* Campo de Observações */}
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-textPrimary mb-1">
                        Alguma observação?
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: tirar a cebola, maionese à parte etc."
                        value={item.observation || ''}
                        onChange={(e) => updateObservation(item.id, e.target.value)}
                        className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={closeCart}
                className="block w-full text-center text-[#EA1D2C] font-semibold text-sm hover:underline focus:outline-none"
              >
                Adicionar mais itens
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold mb-2">Entrega ou retirada</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`border-2 rounded-lg px-3 py-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    deliveryType === 'delivery'
                      ? 'border-primary bg-card'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaMotorcycle size={14} />
                  Entrega
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`border-2 rounded-lg px-3 py-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    deliveryType === 'pickup'
                      ? 'border-primary bg-card'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaStore size={14} />
                  Retirada
                </button>
              </div>
            </div>
            <div className="space-y-1 text-sm text-textSecondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>
                  {deliveryType === 'delivery'
                    ? `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`
                    : 'gratis'}
                </span>
              </div>
            </div>
            {!isMinimumMet && (
              <div className="bg-yellow-50 border-2 border-yellow-300 text-yellow-800 rounded-lg p-3 text-sm">
                Pedido minimo: R$ 20,00 (sem frete). Faltam R$ {(minimumOrder - subtotal).toFixed(2).replace('.', ',')}.
              </div>
            )}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <button
              onClick={() => {
                closeCart();
                onCheckout();
              }}
              className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isMinimumMet}
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
