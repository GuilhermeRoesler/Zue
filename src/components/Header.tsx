import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface HeaderProps {
  currentSection: string;
  onNavigate: (section: string) => void;
}

const navigationItems = [
  { id: 'home', label: 'Início' },
  { id: 'catalog', label: 'Catálogo' },
  { id: 'about', label: 'Sobre' },
];

const Header = ({ currentSection, onNavigate }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    ready: false,
  });
  const [animateIndicator, setAnimateIndicator] = useState(false);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const item = itemRefs.current.get(currentSection);
    if (!nav || !item) {
      setIndicator((prev) => ({ ...prev, ready: false }));
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    setIndicator({
      left: itemRect.left - navRect.left,
      width: itemRect.width,
      ready: true,
    });
  }, [currentSection]);

  useEffect(() => {
    if (!indicator.ready) return;
    // Evita animar do 0 no primeiro paint; desliza só nas trocas seguintes
    const id = requestAnimationFrame(() => setAnimateIndicator(true));
    return () => cancelAnimationFrame(id);
  }, [indicator.ready]);

  useEffect(() => {
    const sync = () => {
      const nav = navRef.current;
      const item = itemRefs.current.get(currentSection);
      if (!nav || !item) return;
      const navRect = nav.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      setIndicator({
        left: itemRect.left - navRect.left,
        width: itemRect.width,
        ready: true,
      });
    };

    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [currentSection]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="shrink-0">
            <Button
              variant="ghost"
              onClick={() => onNavigate('home')}
              className="h-auto rounded-none px-0 text-2xl font-light tracking-widest text-black hover:bg-transparent hover:text-gray-600"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              ZUE
            </Button>
          </div>

          <nav
            ref={navRef}
            className="relative hidden items-center gap-8 md:flex"
          >
            {navigationItems.map((item) => (
              <span
                key={item.id}
                ref={(node) => {
                  if (node) itemRefs.current.set(item.id, node);
                  else itemRefs.current.delete(item.id);
                }}
                className="inline-flex"
              >
                <Button
                  variant="ghost"
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'h-auto rounded-none border-0 px-0 pb-1 text-sm font-light tracking-wide hover:bg-transparent focus-visible:ring-0',
                    currentSection === item.id
                      ? 'text-black'
                      : 'text-gray-600 hover:text-black'
                  )}
                >
                  {item.label}
                </Button>
              </span>
            ))}

            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute bottom-0 h-px bg-black',
                animateIndicator &&
                  'motion-safe:transition-[left,width,opacity] motion-safe:duration-300 motion-safe:ease-in-out',
                indicator.ready ? 'opacity-100' : 'opacity-0'
              )}
              style={{ left: indicator.left, width: indicator.width }}
            />
          </nav>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none text-gray-600 hover:bg-transparent hover:text-black md:hidden"
              >
                <Menu className="size-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className="top-16 gap-0 border-b border-gray-100 bg-white p-0 shadow-none"
              showCloseButton={false}
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 px-4 py-6">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      'h-auto w-full justify-start rounded-none px-0 text-lg font-light tracking-wide hover:bg-transparent focus-visible:border-transparent focus-visible:ring-0',
                      currentSection === item.id ? 'text-black' : 'text-gray-600'
                    )}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
