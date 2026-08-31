import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FooterProps {
  onNavigate: (section: string) => void;
}

const Footer = ({ onNavigate }: FooterProps) => {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <h3
              className="mb-6 text-3xl font-light tracking-widest"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              ZUE
            </h3>
            <p className="max-w-md font-light leading-relaxed text-gray-300">
              Elegância atemporal para a mulher moderna. Peças únicas que celebram personalidade e sofisticação.
            </p>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-light tracking-wide">Navegação</h4>
            <nav className="flex flex-col items-start gap-2">
              {[
                { id: 'home', label: 'Início' },
                { id: 'catalog', label: 'Catálogo' },
                { id: 'about', label: 'Sobre' },
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
        </div>

        <Separator className="mt-12 bg-gray-800" />

        <div className="pt-8">
          <p className="text-center text-sm font-light text-gray-400 md:text-left">
            © 2025 Zue. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
