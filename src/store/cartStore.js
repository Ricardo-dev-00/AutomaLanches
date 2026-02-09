import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      deliveryType: 'delivery',
      deliveryFee: 5,
      
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        });
      },
      
      updateObservation: (productId, observation) => {
        set({
          items: get().items.map(item =>
            item.id === productId ? { ...item, observation } : item
          )
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set({ isOpen: !get().isOpen }),
      
      openCart: () => set({ isOpen: true }),
      
      closeCart: () => set({ isOpen: false }),

      setDeliveryType: (deliveryType) => set({ deliveryType }),
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getTotalWithDelivery: () => {
        const subtotal = get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const fee = get().deliveryType === 'delivery' ? get().deliveryFee : 0;
        return subtotal + fee;
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'automalanches-cart',
      partialize: (state) => ({ items: state.items })
    }
  )
);

export default useCartStore;
