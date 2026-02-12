import { useState, lazy, Suspense, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import CartButton from './components/CartButton';
import Footer from './components/Footer';

// Lazy load componentes pesados
const Checkout = lazy(() => import('./components/Checkout'));
const PixPayment = lazy(() => import('./components/PixPayment'));
const OrderConfirmation = lazy(() => import('./components/OrderConfirmation'));

import { products, categories } from './data/products';
import { sendOrderToTelegram } from './services/api';
import useCartStore from './store/cartStore';

function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState('home'); // home, checkout, pix, confirmation
  const [orderData, setOrderData] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  const { items, deliveryFee, getTotalWithDelivery, clearCart, setItems, openCart } = useCartStore();
  
  // Processar query string para repetição de pedido
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const repeatOrderId = params.get('repeatOrder');
    
    if (repeatOrderId) {
      // Buscar itens do pedido anterior
      fetch(`/api/order/${repeatOrderId}`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.items) {
            // Limpar carrinho e adicionar itens do pedido anterior
            clearCart();
            setItems(data.items);
            openCart();
            
            // Remover o parâmetro da URL para não tentar carregar novamente
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(error => console.error('Erro ao carregar pedido anterior:', error));
    }
  }, []);
  
  // Função para resetar para home
  const handleResetToHome = () => {
    setSelectedCategory('all');
    setExpandedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Função para scrollar até a categoria
  const scrollToCategory = (categoryId) => {
    setTimeout(() => {
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  
  // Filtrar produtos por categoria
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    requestAnimationFrame(() => {
      const targetId = categoryId === 'all' ? 'product-list-start' : 'category-title';
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };
  
  // Ir para checkout
  const handleCheckout = () => {
    setCurrentPage('checkout');
  };
  
  // Voltar do checkout para o carrinho
  const handleBackToCart = () => {
    setCurrentPage('home');
    openCart();
  };
  
  // Continuar do checkout
  const handleContinueFromCheckout = (data) => {
    setOrderData(data);
    
    if (data.paymentMethod === 'pix') {
      setCurrentPage('pix');
    } else {
      // Se não for Pix, envia direto
      handleConfirmOrder(data);
    }
  };
  
  // Voltar do Pix para checkout
  const handleBackFromPix = () => {
    setCurrentPage('checkout');
  };
  
  // Confirmar pedido e enviar para Telegram
  const handleConfirmOrder = async (data) => {
    try {
      const orderPayload = {
        deliveryType: data.deliveryType,
        name: data.name,
        whatsapp: data.whatsapp,
        street: data.street || '',
        number: data.number || '',
        neighborhood: data.neighborhood || '',
        reference: data.reference || '',
        paymentMethod: data.paymentMethod,
        needsChange: data.needsChange || false,
        changeFor: data.changeFor || '',
        items: items,
        deliveryFee: data.deliveryType === 'delivery' ? deliveryFee : 0,
        total: getTotalWithDelivery()
      };
      
      const response = await sendOrderToTelegram(orderPayload);
      
      if (response.orderNumber) {
        setOrderNumber(response.orderNumber);
      }
      
      setCurrentPage('confirmation');
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      alert('Erro ao enviar pedido. Por favor, tente novamente.');
    }
  };
  
  // Fechar confirmação e resetar
  const handleCloseConfirmation = () => {
    clearCart();
    setOrderData(null);
    setOrderNumber(null);
    setCurrentPage('home');
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header onLogoClick={handleResetToHome} />
      
      {currentPage === 'home' && (
        <>
          <Hero />
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
          
          <main id="product-list-start" className="max-w-7xl mx-auto px-4 py-6 mb-20 scroll-mt-24">
            {selectedCategory !== 'all' && (
              <h2 id="category-title" className="text-2xl sm:text-xl font-bold text-textPrimary text-center mb-6 scroll-mt-24">
                <span className="mr-2">{categories.find(category => category.id === selectedCategory)?.icon}</span>
                {categories.find(category => category.id === selectedCategory)?.name}
              </h2>
            )}
            <ProductList products={filteredProducts} showCategoryTitles={selectedCategory === 'all'} />
          </main>

          <section className="max-w-7xl mx-auto px-4 pb-10">
            <h3 className="text-lg font-bold text-textPrimary mb-3">Menu</h3>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category.id}>
                  <button
                    onClick={() => {
                      const isExpanding = expandedCategory !== category.id;
                      setExpandedCategory(prev => (prev === category.id ? null : category.id));
                      if (isExpanding) {
                        scrollToCategory(category.id);
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-left bg-card text-textPrimary hover:bg-gray-200 transition-all duration-200"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </span>
                    <span className={`text-lg transition-transform duration-200 ${
                      expandedCategory === category.id ? 'rotate-180' : 'rotate-0'
                    }`}>
                      {expandedCategory === category.id ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    id={`category-${category.id}`}
                    className={`mt-3 overflow-hidden transition-all duration-300 ease-out ${
                      expandedCategory === category.id ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <ProductList
                      products={products.filter(p => p.category === category.id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
          
          <Footer />
          
          <Cart onCheckout={handleCheckout} />
          <CartButton />
        </>
      )}
      
      {currentPage === 'checkout' && (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
          <Checkout 
            onBack={handleBackToCart}
            onContinue={handleContinueFromCheckout}
          />
        </Suspense>
      )}
      
      {currentPage === 'pix' && (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
          <PixPayment 
            orderData={orderData}
            onBack={handleBackFromPix}
            onConfirm={handleConfirmOrder}
          />
        </Suspense>
      )}
      
      {currentPage === 'confirmation' && (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
          <OrderConfirmation onClose={handleCloseConfirmation} orderNumber={orderNumber} deliveryType={orderData?.deliveryType} />
        </Suspense>
      )}
    </div>
  );
}

export default App;
