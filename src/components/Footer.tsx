import React from 'react';
import { MessageCircle, Mail, Instagram, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Olá! Gostaria de mais informações sobre a Zue.");
    window.open(`https://wa.me/5551989354834?text=${message}`, '_blank');
  };

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-light mb-6 tracking-widest" style={{ fontFamily: 'Playfair Display, serif' }}>
              ZUE
            </h3>
            <p className="text-gray-300 font-light leading-relaxed mb-6 max-w-md">
              Elegância atemporal para a mulher moderna. Descobra peças únicas que celebram sua personalidade e sofisticação.
            </p>
            
            <div className="flex items-center gap-6">
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-light text-sm">WhatsApp</span>
              </button>
              
              <a
                href="mailto:guiroesler2@gmail.com"
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                <Mail className="w-5 h-5" />
                <span className="font-light text-sm">E-mail</span>
              </a>
              
              <a
                href="#"
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
                <span className="font-light text-sm">Instagram</span>
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-lg font-light mb-6 tracking-wide">Navegação</h4>
            <nav className="space-y-4">
              {[
                { id: 'home', label: 'Início' },
                { id: 'catalog', label: 'Catálogo' },
                { id: 'about', label: 'Sobre' },
                { id: 'contact', label: 'Contato' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="block text-gray-300 hover:text-white transition-colors duration-300 font-light text-sm"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-lg font-light mb-6 tracking-wide">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-300 font-light text-sm">WhatsApp</p>
                  <p className="text-white font-light text-sm">+55 (51) 98935-4834</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-300 font-light text-sm">E-mail</p>
                  <p className="text-white font-light text-sm">guiroesler2@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-300 font-light text-sm">Localização</p>
                  <p className="text-white font-light text-sm">Rio Grande do Sul, Brasil</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 font-light text-sm text-center md:text-left">
              © 2025 Zue. Todos os direitos reservados.
            </p>
            
            <div className="flex items-center gap-8 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 font-light">
                Política de Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 font-light">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;