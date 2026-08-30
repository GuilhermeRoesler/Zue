import { MessageCircle, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface FooterProps {
  onNavigate: (section: string) => void;
}

const Footer = ({ onNavigate }: FooterProps) => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Olá! Gostaria de mais informações sobre a Zue.');
    window.open(`https://wa.me/5551989354834?text=${message}`, '_blank');
  };

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <h3
              className="mb-6 text-3xl font-light tracking-widest"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              ZUE
            </h3>
            <p className="mb-6 max-w-md font-light leading-relaxed text-gray-300">
              Elegância atemporal para a mulher moderna. Descubra peças únicas que celebram sua personalidade e sofisticação.
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleWhatsAppClick}
                className="h-auto gap-2 rounded-none px-2 text-white hover:bg-transparent hover:text-gray-300"
              >
                <MessageCircle className="size-5" />
                <span className="text-sm font-light">WhatsApp</span>
              </Button>

              <Button
                variant="ghost"
                asChild
                className="h-auto gap-2 rounded-none px-2 text-white hover:bg-transparent hover:text-gray-300"
              >
                <a href="mailto:guiroesler2@gmail.com">
                  <Mail className="size-5" />
                  <span className="text-sm font-light">E-mail</span>
                </a>
              </Button>

              <Button
                variant="ghost"
                asChild
                className="h-auto gap-2 rounded-none px-2 text-white hover:bg-transparent hover:text-gray-300"
              >
                <a href="#">
                  <InstagramIcon className="size-5" />
                  <span className="text-sm font-light">Instagram</span>
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-light tracking-wide">Navegação</h4>
            <nav className="flex flex-col items-start gap-2">
              {[
                { id: 'home', label: 'Início' },
                { id: 'catalog', label: 'Catálogo' },
                { id: 'about', label: 'Sobre' },
                { id: 'contact', label: 'Contato' },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => onNavigate(item.id)}
                  className="h-auto rounded-none px-0 text-sm font-light text-gray-300 hover:bg-transparent hover:text-white"
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-light tracking-wide">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 size-5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-light text-gray-300">WhatsApp</p>
                  <p className="text-sm font-light text-white">+55 (51) 98935-4834</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-light text-gray-300">E-mail</p>
                  <p className="text-sm font-light text-white">guiroesler2@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-light text-gray-300">Localização</p>
                  <p className="text-sm font-light text-white">Rio Grande do Sul, Brasil</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="mt-12 bg-gray-800" />

        <div className="flex flex-col items-center justify-between gap-6 pt-8 md:flex-row">
          <p className="text-center text-sm font-light text-gray-400 md:text-left">
            © 2025 Zue. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              asChild
              className="h-auto rounded-none px-2 text-sm font-light text-gray-400 hover:bg-transparent hover:text-white"
            >
              <a href="#">Política de Privacidade</a>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="h-auto rounded-none px-2 text-sm font-light text-gray-400 hover:bg-transparent hover:text-white"
            >
              <a href="#">Termos de Uso</a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
