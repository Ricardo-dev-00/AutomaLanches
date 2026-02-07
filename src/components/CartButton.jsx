import useCartStore from '../store/cartStore';

const CartButton = () => {
  const { getItemCount, getTotal, openCart } = useCartStore();
  const itemCount = getItemCount();
  const total = getTotal();
  
  if (itemCount === 0) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 md:hidden">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <button
          onClick={openCart}
          className="btn-primary w-full flex items-center justify-between text-base"
        >
          <span className="flex items-center gap-2">
            🛒 {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          </span>
          <span className="font-bold">
            R$ {total.toFixed(2).replace('.', ',')}
          </span>
        </button>
      </div>
    </div>
  );
};

export default CartButton;
