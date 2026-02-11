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
  const { getTotalWithDelivery, deliveryType, setDeliveryType } = useCartStore();
  const cartTotal = getTotalWithDelivery();
  const [changeConfirmed, setChangeConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
  
  // Função para formatar WhatsApp
  const formatWhatsApp = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Se for o campo whatsapp, formata
    const newValue = name === 'whatsapp' ? formatWhatsApp(value) : value;
    
    const newData = {
      ...formData,
      [name]: newValue
    };
    setFormData(newData);
    saveToLocalStorage(newData);
    
    // Limpa mensagem de erro ao digitar
    if (errorMessage) {
      setErrorMessage('');
    }
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
    setErrorMessage('');
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formData.name.trim()) {
      setErrorMessage('Por favor, preencha seu nome completo.');
      return;
    }
    
    if (!formData.whatsapp.trim()) {
      setErrorMessage('Por favor, preencha seu número de WhatsApp.');
      return;
    }
    
    // Verificar se o WhatsApp tem pelo menos 14 caracteres (XX) XXXX-XXXX
    if (formData.whatsapp.replace(/\D/g, '').length < 10) {
      setErrorMessage('Por favor, digite um número de WhatsApp válido.');
      return;
    }
    
    // Verificar se precisa confirmar a questão do troco
    if (formData.paymentMethod === 'dinheiro' && deliveryType === 'delivery' && !changeConfirmed) {
      setErrorMessage('Por favor, informe no campo acima se precisará de troco ou não.');
      return;
    }
    
    if (!isFormValid()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setErrorMessage('');
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
                    className={`input-field ${!formData.name && errorMessage ? 'border-red-500' : ''}`}
                    required
                  />
                  <input
                    type="tel"
                    name="whatsapp"
                    placeholder="WhatsApp (com DDD) *"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className={`input-field ${!formData.whatsapp && errorMessage ? 'border-red-500' : ''}`}
                    maxLength="15"
                    inputMode="numeric"
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
                        {method === 'dinheiro' && (deliveryType === 'delivery' ? '💵 Dinheiro na entrega' : '💵 Dinheiro')}
                        {method === 'cartao' && '💳 Débito ou Crédito'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Bandeiras de cartão */}
              {formData.paymentMethod === 'cartao' && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-4 text-lg">Aceitamos os seguintes cartões</h3>
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-white border-2 border-blue-600 rounded px-4 py-2 font-bold text-blue-600">
                        VISA
                      </div>
                      <span className="text-xs text-textSecondary">Débito/Crédito</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-white border-2 border-red-600 rounded px-4 py-2 font-bold">
                        <span className="text-red-600">Master</span><span className="text-orange-600">Card</span>
                      </div>
                      <span className="text-xs text-textSecondary">Débito/Crédito</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-orange-600 text-white rounded px-4 py-2 font-bold">
                        ELO
                      </div>
                      <span className="text-xs text-textSecondary">Débito/Crédito</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Troco (apenas se dinheiro e entrega) */}
              {formData.paymentMethod === 'dinheiro' && deliveryType === 'delivery' && (
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
                            setErrorMessage('');
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
                            setErrorMessage('');
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
                            required
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
                                const changeValue = parseFloat(formData.changeFor.replace('R$', '').replace('.', '').replace(',', '.'));
                                if (changeValue < cartTotal) {
                                  setErrorMessage(`O valor informado para troco deve ser maior que o valor total do pedido (${cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}).`);
                                  return;
                                }
                                setChangeConfirmed(true);
                                setErrorMessage('');
                              } else {
                                setErrorMessage('Por favor, informe o valor para troco');
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
                        onClick={() => {
                          setChangeConfirmed(true);
                          setErrorMessage('');
                        }}
                        className="btn-primary w-full"
                      >
                        ✓ Confirmar (sem troco)
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Mensagem de Erro */}
              {errorMessage && (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 text-red-700 font-medium">
                  ⚠️ {errorMessage}
                </div>
              )}
              
              {/* Botão Continuar */}
              <button
                type="submit"
                className={`btn-primary w-full text-lg ${
                  formData.paymentMethod === 'dinheiro' && !changeConfirmed
                    ? 'bg-gray-300 cursor-not-allowed hover:bg-gray-300'
                    : ''
                }`}
              >
                Confirmar pedido {cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                      <p className="font-semibold text-textPrimary">Rei da Chapa</p>
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
