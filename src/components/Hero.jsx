import { FaInstagram, FaFacebook, FaTwitter, FaWhatsapp } from 'react-icons/fa';

const Hero = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5598985881871';
  const lanchoneteWhatsApp = `https://wa.me/${whatsappNumber}`;
  
  return (
    <section className="mt-16 relative bg-black text-white overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/banner/chapaquente.png)' }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
            Onde o sabor reina 👑
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base mb-6">
            <div className="flex items-center gap-2 animate-pulse">
              <span className="text-2xl">⚡</span>
              <span className="drop-shadow">Entrega Rápida</span>
            </div>
            <div className="flex items-center gap-2 animate-pulse">
              <span className="text-2xl">🔥</span>
              <span className="drop-shadow">Sempre Fresquinho</span>
            </div>
            <div className="flex items-center gap-2 animate-pulse">
              <span className="text-2xl">💳</span>
              <span className="drop-shadow">Pix, Dinheiro ou Cartão</span>
            </div>
          </div>
          
          {/* Redes Sociais */}
          <div className="flex justify-center gap-6">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white bg-[#E4405F] p-3 rounded-full hover:brightness-110 transition-all transform hover:scale-110 shadow-lg"
              title="Instagram"
            >
              <FaInstagram size={28} />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white bg-[#1877F2] p-3 rounded-full hover:brightness-110 transition-all transform hover:scale-110 shadow-lg"
              title="Facebook"
            >
              <FaFacebook size={28} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white bg-[#1DA1F2] p-3 rounded-full hover:brightness-110 transition-all transform hover:scale-110 shadow-lg"
              title="Twitter"
            >
              <FaTwitter size={28} />
            </a>
            <a 
              href={lanchoneteWhatsApp}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white bg-[#25D366] p-3 rounded-full hover:brightness-110 transition-all transform hover:scale-110 shadow-lg"
              title="WhatsApp"
            >
              <FaWhatsapp size={28} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
