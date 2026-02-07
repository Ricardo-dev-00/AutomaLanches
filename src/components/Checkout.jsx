import { useState, useEffect } from 'react';
import { FaTruck, FaStore, FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa';
import useCartStore from '../store/cartStore';

const AVAILABLE_NEIGHBORHOODS = [
  'Cidade Operária',
  'Jardim América',
  'São Cristóvão',
  'IPEM São Cristóvão',
  'Maiobinha',
  'Vila Flamengo',
  'Apaco',
  'Recanto dos Pássaros',
  'Recanto dos Signos',
  'Vila Cafeteira'
];

const Checkout = ({ onBack, onContinue }) => {
  const { getTotal } = useCartStore();
  const cartTotal = getTotal();
  
  const [deliveryType, setDeliveryType] = useState('');
  const [changeConfirmed, setChangeConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    street: '',
    number: '',
    neighborhood: '',
    reference: '',
    paymentMethod: '',
    needsChange: false,
    changeFor: ''
  });
  
  // Carregar dados do localStorage ao montar o componente
  useEffect(() => {
    const savedData = localStorage.getItem('automaLanches_customerData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          name: parsed.name || '',
          whatsapp: parsed.whatsapp || '',
          street: parsed.street || '',
          number: parsed.number || '',
          neighborhood: parsed.neighborhood || '',
          reference: parsed.reference || ''
        }));
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
  }, []);
  
  // Salvar dados no localStorage quando houver mudanças
  const saveToLocalStorage = (data) => {
    const dataToSave = {
      name: data.name,
      whatsapp: data.whatsapp,
      street: data.street,
      number: data.number,
      neighborhood: data.neighborhood,
      reference: data.reference
    };
    localStorage.setItem('automaLanches_customerData', JSON.stringify(dataToSave));
  };
  
  const handleChange = (e) => {
    const newData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    setFormData(newData);
    saveToLocalStorage(newData);
  };
  
  const handleChangeForInput = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    if (value) {
      const numValue = parseInt(value) / 100;
      const formatted = numValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
      setFormData({
        ...formData,
        changeFor: formatted
      });
    } else {
      setFormData({
        ...formData,
        changeFor: ''
      });
    }
  };
  
  const handlePaymentMethodChange = (method) => {
    setFormData({
      ...formData,
      paymentMethod: method,
      needsChange: false,
      changeFor: ''
    });
    setChangeConfirmed(false);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onContinue({ deliveryType, ...formData });
  };
  
  const isFormValid = () => {
    if (!deliveryType || !formData.name || !formData.whatsapp || !formData.paymentMethod) {
      return false;
    }
    
    if (deliveryType === 'delivery') {
      if (!formData.street || !formData.number || !formData.neighborhood) {
        return false;
      }
    }
    
    if (formData.paymentMethod === 'dinheiro' && !changeConfirmed) {
      return false;
    }
    
    return true;
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
          <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Entrega */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Como deseja receber?</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  deliveryType === 'delivery'
                    ? 'border-primary bg-card'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaTruck size={24} className={deliveryType === 'delivery' ? 'text-primary' : 'text-gray-400'} />
                <span className="font-semibold">Entrega</span>
              </button>
              
              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  deliveryType === 'pickup'
                    ? 'border-primary bg-card'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaStore size={24} className={deliveryType === 'pickup' ? 'text-primary' : 'text-gray-400'} />
                <span className="font-semibold">Retirada</span>
              </button>
            </div>
          </div>
          
          {/* Dados Pessoais */}
          {deliveryType && (
            <>
              <div>
                <h3 className="font-semibold mb-3 text-lg">Seus dados</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nome completo *"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  <input
                    type="tel"
                    name="whatsapp"
                    placeholder="WhatsApp (com DDD) *"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              
              {/* Endereço (apenas para entrega) */}
              {deliveryType === 'delivery' && (
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Endereço de entrega</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="street"
                      placeholder="Rua *"
                      value={formData.street}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="number"
                        placeholder="Número *"
                        value={formData.number}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                      <select
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleChange}
                        className="input-field"
                        required
                      >
                        <option value="">Selecione o bairro *</option>
                        {AVAILABLE_NEIGHBORHOODS.map(neighborhood => (
                          <option key={neighborhood} value={neighborhood}>
                            {neighborhood}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Informações adicionais do endereço
                      </label>
                      <input
                        type="text"
                        name="reference"
                        placeholder="Ex: bloco, unidade, quadra, lote, fundos, casa 2"
                        value={formData.reference}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Forma de Pagamento */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Forma de pagamento</h3>
                <div className="space-y-2">
                  {['pix', 'dinheiro', 'cartao'].map(method => (
                    <label
                      key={method}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === method
                          ? 'border-primary bg-card'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={formData.paymentMethod === method}
                        onChange={() => handlePaymentMethodChange(method)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="font-medium">
                        {method === 'pix' && '💳 Pix'}
                        {method === 'dinheiro' && '💵 Dinheiro na entrega'}
                        {method === 'cartao' && '💳 Cartão na entrega'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Troco (apenas se dinheiro) */}
              {formData.paymentMethod === 'dinheiro' && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-lg">Precisa de troco?</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="needsChange"
                          checked={!formData.needsChange}
                          onChange={() => {
                            setFormData({...formData, needsChange: false, changeFor: ''});
                            setChangeConfirmed(false);
                          }}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="font-medium">Não preciso de troco</span>
                      </label>
                    </div>
                    <div className="flex gap-3 items-start">
                      <label className="flex items-center gap-2 cursor-pointer pt-3">
                        <input
                          type="radio"
                          name="needsChange"
                          checked={formData.needsChange}
                          onChange={() => {
                            setFormData({...formData, needsChange: true});
                            setChangeConfirmed(false);
                          }}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="font-medium">Preciso de troco</span>
                      </label>
                    </div>
                    {formData.needsChange && (
                      <div className="ml-6 space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Troco para quanto? *
                          </label>
                          <input
                            type="text"
                            name="changeFor"
                            placeholder="R$ 0,00"
                            value={formData.changeFor}
                            onChange={handleChangeForInput}
                            className="input-field"
                            disabled={changeConfirmed}
                          />
                          <p className="text-xs text-textSecondary mt-1">
                            Digite apenas números
                          </p>
                        </div>
                        {!changeConfirmed ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (formData.changeFor) {
                                setChangeConfirmed(true);
                              } else {
                                alert('Por favor, informe o valor para troco');
                              }
                            }}
                            disabled={!formData.changeFor}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ✓ Confirmar Troco
                          </button>
                        ) : (
                          <div className="bg-green-100 border-2 border-green-500 text-green-700 p-4 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">✓ Troco confirmado: {formData.changeFor}</p>
                                <p className="text-sm mt-1">
                                  <span className="font-medium">Valor do pedido:</span> {cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                                <p className="text-sm font-semibold text-green-800 mt-1">
                                  <span className="font-medium">Você receberá de troco:</span> {
                                    (() => {
                                      const changeValue = parseFloat(formData.changeFor.replace('R$', '').replace('.', '').replace(',', '.'));
                                      const change = changeValue - cartTotal;
                                      return change > 0 ? change.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
                                    })()
                                  }
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setChangeConfirmed(false)}
                                className="text-sm underline hover:no-underline whitespace-nowrap ml-2"
                              >
                                Alterar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {!formData.needsChange && (
                      <button
                        type="button"
                        onClick={() => setChangeConfirmed(true)}
                        className="btn-primary w-full"
                      >
                        ✓ Confirmar (sem troco)
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Botão Continuar */}
              <button
                type="submit"
                disabled={!isFormValid()}
                className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
              
              {/* Localização da Lanchonete (sempre no final, apenas para retirada) */}
              {deliveryType === 'pickup' && (
                <div className="bg-green-50 border-2 border-primary rounded-lg p-5">
                  <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary" />
                    Local de Retirada
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-textPrimary">AutomaLanches</p>
                      <p className="text-textSecondary">Rua Exemplo, 123 - Centro</p>
                      <p className="text-textSecondary">São Luís - MA</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-textPrimary mb-1">Horário de Funcionamento:</p>
                      <p className="text-sm text-textSecondary">Segunda a Sexta: 18h às 23h</p>
                      <p className="text-sm text-textSecondary">Sábado e Domingo: 18h às 00h</p>
                    </div>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=AutomaLanches+São+Luís"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-secondary transition-colors font-medium"
                    >
                      <FaMapMarkerAlt />
                      Abrir no Google Maps
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Checkout;
