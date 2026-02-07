import { FaPlus } from 'react-icons/fa';
import useCartStore from '../store/cartStore';

const ProductCard = ({ product }) => {
  const addItem = useCartStore(state => state.addItem);
  
  const handleAddToCart = () => {
    addItem(product);
  };
  
  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      {/* Imagem */}
      <div className="relative h-48 bg-gray-200">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-textPrimary">
          {product.name}
        </h3>
        <p className="text-sm text-textSecondary mb-4 line-clamp-2">
          {product.description}
        </p>
        
        {/* Preço e Botão */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-primary text-white p-3 rounded-full hover:bg-secondary transition-colors active:scale-95 shadow-md"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <FaPlus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
