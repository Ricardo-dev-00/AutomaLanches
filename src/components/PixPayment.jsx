import { useState, useEffect } from 'react';
import { FaArrowLeft, FaCopy, FaCheck, FaWhatsapp, FaRocket } from 'react-icons/fa';
import useCartStore from '../store/cartStore';
import QRCode from 'qrcode';

const PixPayment = ({ orderData, onBack, onConfirm, onClosed }) => {
  const [copied, setCopied] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const { getTotalWithDelivery } = useCartStore();
  const total = getTotalWithDelivery();
  
  const pixKey = import.meta.env.VITE_PIX_KEY || 'suachavepix@email.com';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5598985881871';
  
  // Gerar código Pix ao montar componente
  useEffect(() => {
    const generatePix = async () => {
      try {
        // Detectar se estamos em localhost ou produção
        let apiUrl = '';
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          apiUrl = 'http://localhost:3001';
        }
        // Se apiUrl está vazio, usar URL relativa
        const url = apiUrl ? `${apiUrl}/api/generate-pix` : '/api/generate-pix';
        console.log('📁 Requisitando Pix em:', url);
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: total })
        });
        
        if (!response.ok) {
          let errorMessage = 'Erro ao gerar código Pix.';

          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }

          if (errorMessage.includes('Estamos fechados')) {
            onClosed?.();
            return;
          }

          console.error('Erro ao gerar Pix:', errorMessage);
          return;
        }
        
        const data = await response.json();
        if (data.success) {
          setPixCode(data.pixCode);
          
          // Gerar QR Code
          const qrUrl = await QRCode.toDataURL(data.pixCode, {
            width: 256,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeUrl(qrUrl);
        }
      } catch (error) {
        console.error('Erro ao gerar Pix:', error);
      } finally {
        setLoading(false);
      }
    };
    
    generatePix();
  }, [total]);
  
  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };
  
  const handleSendReceipt = () => {
    const message = `Oi!\nPix de *R$ ${total.toFixed(2).replace('.', ',')}* realizado no nome de *${orderData.name}.*\n*Segue comprovante para conferência.*`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Aguarda um momento e confirma o pedido
    setTimeout(() => {
      onConfirm(orderData);
    }, 1000);
  };
  
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white py-4 z-10">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Voltar"
          >
            <FaArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold">Pagamento Pix</h2>
        </div>
        
        <div className="space-y-6">
          {/* Valor */}
          <div className="bg-card p-6 rounded-xl text-center">
            <p className="text-textSecondary mb-2">Valor a pagar</p>
            <p className="text-4xl font-bold text-primary">
              R$ {total.toFixed(2).replace('.', ',')}
            </p>
          </div>
          
          {/* Instruções */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>⚠️</span>
              Como pagar
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-textSecondary">
              <li>Copie o código Pix abaixo</li>
              <li>Abra o app do seu banco</li>
              <li>Escolha "Pix Copia e Cola"</li>
              <li>Cole o código copiado</li>
              <li>Confirme o valor e finalize</li>
              <li>Envie o comprovante pelo WhatsApp</li>
            </ol>
          </div>
          
          {/* Código Pix Copia e Cola */}
          <div>
            <label className="block font-semibold mb-2">Código Pix Copia e Cola</label>
            {loading ? (
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-textSecondary">Gerando código Pix...</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-3 rounded-lg mb-2 max-h-32 overflow-y-auto">
                  <code className="text-xs break-all text-textSecondary">
                    {pixCode || 'Erro ao gerar código'}
                  </code>
                </div>
                <button
                  onClick={handleCopyPix}
                  disabled={!pixCode}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <FaCheck /> Código Copiado!
                    </>
                  ) : (
                    <>
                      <FaCopy /> Copiar Código Pix
                    </>
                  )}
                </button>
              </>
            )}
          </div>
          
          {/* QR Code Placeholder */}
          <div className="bg-card p-6 rounded-xl">
            <p className="text-center text-textSecondary mb-4 font-semibold">
              Ou escaneie o QR Code
            </p>
            {loading ? (
              <div className="w-64 h-64 mx-auto bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-textSecondary">Gerando QR Code...</p>
              </div>
            ) : qrCodeUrl ? (
              <div className="flex justify-center">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code Pix" 
                  className="w-64 h-64 border-4 border-white rounded-lg shadow-lg"
                />
              </div>
            ) : (
              <div className="w-64 h-64 mx-auto bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <p className="text-textSecondary text-center px-4">
                  Erro ao gerar QR Code
                </p>
              </div>
            )}
          </div>
          
          {/* Botão de Confirmação */}
          <div className="space-y-4">
            <button
              onClick={handleSendReceipt}
              className="btn-primary w-full text-lg flex items-center justify-center gap-2"
            >
              <FaWhatsapp size={20} />
              Já paguei - Enviar Comprovante
            </button>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-center text-sm text-textSecondary mb-3">
                Ao clicar no botão acima, você será direcionado ao WhatsApp para enviar o comprovante.
              </p>
              <div className="bg-green-100 border-l-4 border-green-500 rounded p-3 flex items-start gap-3">
                <FaRocket className="text-green-600 mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="font-bold text-green-700">Seu pedido será enviado automaticamente!</p>
                  <p className="text-sm text-green-600 mt-1">Assim que confirmarmos o pagamento, você receberá um aviso no WhatsApp informando que seu pedido está sendo preparado.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixPayment;
