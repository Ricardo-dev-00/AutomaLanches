import { FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import useCartStore from '../store/cartStore';

const Cart = ({ onCheckout }) => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, updateObservation, getTotal } = useCartStore();
  
  const total = getTotal();
  
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
          <h2 className="text-xl font-bold">Meu Carrinho</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fechar carrinho"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
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
            </div>
          )}
        </div>
        
        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
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
              className="btn-primary w-full text-lg"
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
