import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import CartButton from './components/CartButton';
import Checkout from './components/Checkout';
import PixPayment from './components/PixPayment';
import OrderConfirmation from './components/OrderConfirmation';
import Footer from './components/Footer';
import { products } from './data/products';
import { sendOrderToTelegram } from './services/api';
import useCartStore from './store/cartStore';

function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState('home'); // home, checkout, pix, confirmation
  const [orderData, setOrderData] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  
  const { items, getTotal, clearCart } = useCartStore();
  
  // Filtrar produtos por categoria
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);
  
  // Ir para checkout
  const handleCheckout = () => {
    setCurrentPage('checkout');
  };
  
  // Voltar para home
  const handleBackToHome = () => {
    setCurrentPage('home');
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
        total: getTotal()
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
      <Header />
      
      {currentPage === 'home' && (
        <>
          <Hero />
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
          <main className="max-w-7xl mx-auto px-4 py-6 mb-20">
            <ProductList products={filteredProducts} />
          </main>
          
          <Footer />
          
          <Cart onCheckout={handleCheckout} />
          <CartButton />
        </>
      )}
      
      {currentPage === 'checkout' && (
        <Checkout 
          onBack={handleBackToHome}
          onContinue={handleContinueFromCheckout}
        />
      )}
      
      {currentPage === 'pix' && (
        <PixPayment 
          orderData={orderData}
          onBack={handleBackFromPix}
          onConfirm={handleConfirmOrder}
        />
      )}
      
      {currentPage === 'confirmation' && (
        <OrderConfirmation onClose={handleCloseConfirmation} orderNumber={orderNumber} />
      )}
    </div>
  );
}

export default App;
