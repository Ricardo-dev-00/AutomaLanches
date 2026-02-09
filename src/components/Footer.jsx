import { FaInstagram, FaFacebook, FaTwitter, FaWhatsapp, FaMapMarkerAlt, FaClock, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5598985881871';
  const lanchoneteWhatsApp = `https://wa.me/${whatsappNumber}`;
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-[#1a8a47] to-[#0a5549] text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Sobre */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-2xl shadow-lg">
                👑
              </div>
              <h3 className="text-xl font-bold">Rei da Chapa</h3>
            </div>
            <p className="text-white/80 text-sm">
              Sabor que chega até você! Delivery e retirada no local com os melhores hambúrgueres, pizzas e muito mais.
            </p>
          </div>
          
          {/* Contato */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contato</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                <span className="text-white/80">Rua Exemplo, 123 - Centro<br />São Luís - MA</span>
              </div>
              <div className="flex items-center gap-2">
                <FaWhatsapp className="flex-shrink-0" />
                <a href={lanchoneteWhatsApp} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
                  +55 98 98588-1871
                </a>
              </div>
              <div className="flex items-start gap-2">
                <FaClock className="mt-1 flex-shrink-0" />
                <div className="text-white/80">
                  <p>Seg - Sex: 18h às 23h</p>
                  <p>Sáb - Dom: 18h às 00h</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Redes Sociais */}
          <div>
            <h3 className="text-lg font-bold mb-4">Siga-nos</h3>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#E4405F] p-3 rounded-full hover:brightness-110 transition-all transform hover:scale-110"
                title="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#1877F2] p-3 rounded-full hover:brightness-110 transition-all transform hover:scale-110"
                title="Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#1DA1F2] p-3 rounded-full hover:brightness-110 transition-all transform hover:scale-110"
                title="Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a 
                href={lanchoneteWhatsApp}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#25D366] p-3 rounded-full hover:brightness-110 transition-all transform hover:scale-110"
                title="WhatsApp"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
            <p className="text-white/80 text-sm mt-4">
              Fique por dentro das nossas promoções e novidades!
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-white/20 pt-6 text-center">
          <p className="text-white/80 text-sm">
            © {currentYear} Rei da Chapa. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
