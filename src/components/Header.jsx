import { FaInstagram, FaWhatsapp, FaFacebook, FaShoppingCart } from 'react-icons/fa';
import useCartStore from '../store/cartStore';

const Header = () => {
  const { getItemCount, openCart } = useCartStore();
  const itemCount = getItemCount();
  
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5511999999999';
  const lanchoneteWhatsApp = `https://wa.me/${whatsappNumber}`;
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-2xl">
              🍔
            </div>
            <div>
              <h1 className="text-xl font-bold text-textPrimary">
                {import.meta.env.VITE_LANCHONETE_NAME || 'AutomaLanches'}
              </h1>
              <p className="text-xs text-textSecondary">Delivery & Retirada</p>
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex items-center gap-4">
            {/* Redes Sociais - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-textSecondary hover:text-primary transition-colors"
              >
                <FaInstagram size={20} />
              </a>
              <a 
                href={lanchoneteWhatsApp}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-textSecondary hover:text-primary transition-colors"
              >
                <FaWhatsapp size={20} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-textSecondary hover:text-primary transition-colors"
              >
                <FaFacebook size={20} />
              </a>
            </div>
            
            {/* Carrinho */}
            <button
              onClick={openCart}
              className="relative p-2 hover:bg-card rounded-full transition-colors"
              aria-label="Abrir carrinho"
            >
              <FaShoppingCart size={24} className="text-primary" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
