import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface HeroProps {
  onNavigate: (section: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Olá! Gostaria de conhecer a nova coleção da Zue.");
    window.open(`https://wa.me/5551989354834?text=${message}`, '_blank');
  };

  return (
    <div className="bg-white">
      {/* Main Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-gray-50 to-white"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-light text-black mb-6 tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
            Elegância
            <br />
            <span className="italic font-normal">Atemporal</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Descubra peças exclusivas que celebram a feminilidade moderna com sofisticação e estilo únicos.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleWhatsAppClick}
              className="group bg-black text-white px-8 py-4 flex items-center gap-3 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-light tracking-wide">Conheça Nossa Coleção</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <button
              onClick={() => onNavigate('catalog')}
              className="group border border-black text-black px-8 py-4 flex items-center gap-3 hover:bg-black hover:text-white transition-all duration-300"
            >
              <span className="font-light tracking-wide">Ver Catálogo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="w-px h-12 bg-gray-300"></div>
        </div>
      </section>

      {/* New Launches Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Lançamentos
            </h2>
            <p className="text-gray-600 font-light text-lg max-w-2xl mx-auto">
              As mais recentes adições à nossa coleção, cuidadosamente selecionadas para mulheres que valorizam qualidade e elegância.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group cursor-pointer">
                <div className="aspect-[3/4] bg-gray-200 mb-6 overflow-hidden">
                  <img 
                    src={`https://images.pexels.com/photos/${item === 1 ? '7679720' : item === 2 ? '7679471' : '7679730'}/pexels-photo-${item === 1 ? '7679720' : item === 2 ? '7679471' : '7679730'}.jpeg?auto=compress&cs=tinysrgb&w=800`}
                    alt={`Lançamento ${item}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-light text-black mb-2 tracking-wide">
                    Peça Exclusiva {item.toString().padStart(2, '0')}
                  </h3>
                  <p className="text-gray-600 text-sm font-light mb-4">
                    Coleção Primavera/Verão 2025
                  </p>
                  <button
                    onClick={handleWhatsAppClick}
                    className="text-black border-b border-transparent hover:border-black transition-all duration-300 font-light tracking-wide text-sm"
                  >
                    Consultar Disponibilidade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Values Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 border border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Q</span>
              </div>
              <h3 className="text-xl font-light text-black mb-4 tracking-wide">Qualidade Premium</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Peças confeccionadas com os melhores materiais e acabamento impecável.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 border border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>E</span>
              </div>
              <h3 className="text-xl font-light text-black mb-4 tracking-wide">Exclusividade</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Coleções limitadas para mulheres que buscam peças únicas e especiais.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 border border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>S</span>
              </div>
              <h3 className="text-xl font-light text-black mb-4 tracking-wide">Sofisticação</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Design atemporal que transcende tendências e valoriza a elegância feminina.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;