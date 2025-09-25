import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';

const About: React.FC = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Olá! Gostaria de saber mais sobre a Zue.");
    window.open(`https://wa.me/5551989354834?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-light text-black mb-6 tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
            Nossa História
          </h1>
          <p className="text-gray-600 font-light text-lg max-w-2xl mx-auto">
            Uma jornada dedicada à celebração da elegância feminina através de peças únicas e atemporais.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-light text-black mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                A Essência da Zue
              </h2>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                Nasceu do desejo de criar peças que transcendessem as tendências passageiras, focando na elegância atemporal e na qualidade excepcional. Nossa marca é dedicada à mulher moderna que valoriza a sofisticação e busca expressar sua personalidade única através da moda.
              </p>
              <p className="text-gray-600 font-light leading-relaxed">
                Cada peça é cuidadosamente selecionada e desenvolvida pensando na mulher contemporânea que aprecia a exclusividade e a atenção aos detalhes. Nossa filosofia se baseia na crença de que a verdadeira elegância está na simplicidade refinada.
              </p>
            </div>
          </div>

          <div className="lg:order-first">
            <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
              <img
                src="https://images.pexels.com/photos/7679613/pexels-photo-7679613.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Zue Fashion"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-light text-black mb-12 text-center tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
            Nossos Valores
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-light text-black mb-4 tracking-wide">Qualidade Excepcional</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Trabalhamos apenas com materiais premium e fornecedores que compartilham nosso compromisso com a excelência em cada detalhe.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-light text-black mb-4 tracking-wide">Design Atemporal</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Criamos peças que transcendem as estações, focando em silhuetas elegantes e cortes precisos que valorizam a feminilidade.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-light text-black mb-4 tracking-wide">Exclusividade</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Oferecemos coleções limitadas para garantir que nossas clientes tenham acesso a peças verdadeiramente especiais e únicas.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-light text-black mb-4 tracking-wide">Atendimento Personalizado</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Cada cliente recebe atenção individual para encontrar peças que complementem perfeitamente seu estilo pessoal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Policies Section */}
        <div className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-light text-black mb-12 text-center tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
              Política da Loja
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 border border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>E</span>
                </div>
                <h3 className="text-lg font-light text-black mb-4 tracking-wide">Entrega</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Retirada na loja com horário agendado. Atendimento personalizado para cada cliente.
                </p>
              </div>

              <div>
                <div className="w-16 h-16 border border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>T</span>
                </div>
                <h3 className="text-lg font-light text-black mb-4 tracking-wide">Trocas</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  30 dias para trocas. Peças em perfeito estado com etiquetas originais.
                </p>
              </div>

              <div>
                <div className="w-16 h-16 border border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>P</span>
                </div>
                <h3 className="text-lg font-light text-black mb-4 tracking-wide">Pagamento</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Pix, cartão de crédito e débito. Negociação via WhatsApp para sua comodidade.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-light text-black mb-8 tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
            Pronta para Descobrir sua Nova Peça Favorita?
          </h2>
          <button
            onClick={handleWhatsAppClick}
            className="group bg-black text-white px-8 py-4 flex items-center gap-3 mx-auto hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-light tracking-wide">Fale Conosco</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;