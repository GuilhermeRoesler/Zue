import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  /** Pressione a logo ~1s no catálogo para abrir configuração de pasta (gerente). */
  onLogoLongPress?: () => void;
}

const navigationItems = [
  { id: 'home', label: 'Início' },
  { id: 'catalog', label: 'Catálogo' },
  { id: 'about', label: 'Sobre' },
];

const LONG_PRESS_MS = 1000;

const Header = ({
  currentSection,
  onNavigate,
  onLogoLongPress,
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [overHero, setOverHero] = useState(
    currentSection === 'home' || currentSection === 'about'
  );
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>();
  const longPressFired = useRef(false);
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    ready: false,
  });
  const [animateIndicator, setAnimateIndicator] = useState(false);

  const isHome = currentSection === 'home';
  const isAbout = currentSection === 'about';
  /** Glass sobre hero full-bleed (Início e Sobre). */
  const hasHeroOverlay = isHome || isAbout;
  const overlayHeroId = isHome
    ? 'zue-home-hero'
    : isAbout
      ? 'zue-about-hero'
      : null;
  const overlay = hasHeroOverlay && overHero && !isMobileMenuOpen;

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current !== undefined) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
  }, []);

  const startLongPress = useCallback(() => {
    clearLongPress();
    longPressFired.current = false;
    if (!onLogoLongPress) return;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onLogoLongPress();
    }, LONG_PRESS_MS);
  }, [clearLongPress, onLogoLongPress]);

  const handleLogoClick = useCallback(() => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    onNavigate('home');
  }, [onNavigate]);

  useEffect(() => () => clearLongPress(), [clearLongPress]);

  useEffect(() => {
    if (!hasHeroOverlay || !overlayHeroId) {
      setOverHero(false);
      return;
    }

    setOverHero(true);

    let io: IntersectionObserver | null = null;
    let cancelled = false;

    const attach = () => {
      const hero = document.getElementById(overlayHeroId);
      if (!hero || cancelled) return false;

      io = new IntersectionObserver(
        ([entry]) => {
          setOverHero(Boolean(entry?.isIntersecting));
        },
        {
          // Sai do overlay quando o hero deixa a faixa sob o header
          rootMargin: '-72px 0px 0px 0px',
          threshold: 0,
        }
      );
      io.observe(hero);
      return true;
    };

    if (!attach()) {
      const id = requestAnimationFrame(() => {
        if (!attach() && !cancelled) setOverHero(true);
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(id);
        io?.disconnect();
      };
    }

    return () => {
      cancelled = true;
      io?.disconnect();
    };
  }, [hasHeroOverlay, overlayHeroId]);

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
  }, [currentSection, overlay]);

  useEffect(() => {
    if (!indicator.ready) return;
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
    <header
      className={cn(
        'z-50 transition-[background-color,border-color,backdrop-filter,color] duration-300',
        hasHeroOverlay ? 'fixed inset-x-0 top-0' : 'sticky top-0',
        overlay
          ? 'border-b border-white/20 bg-white/10 shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.12)] backdrop-blur-md supports-backdrop-filter:bg-white/10'
          : 'border-b border-gray-100 bg-white/95 backdrop-blur-sm'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="shrink-0">
            <Button
              variant="ghost"
              onClick={handleLogoClick}
              onPointerDown={startLongPress}
              onPointerUp={clearLongPress}
              onPointerLeave={clearLongPress}
              onPointerCancel={clearLongPress}
              className={cn(
                'h-auto select-none rounded-none px-0 font-heading text-2xl font-light tracking-widest hover:bg-transparent',
                overlay
                  ? 'text-white hover:text-white/75'
                  : 'text-black hover:text-gray-600'
              )}
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
                    overlay
                      ? currentSection === item.id
                        ? 'text-white'
                        : 'text-white/65 hover:text-white'
                      : currentSection === item.id
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
                'pointer-events-none absolute bottom-0 h-px',
                overlay ? 'bg-white' : 'bg-black',
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
                className={cn(
                  'rounded-none hover:bg-transparent md:hidden',
                  overlay
                    ? 'text-white hover:text-white/75'
                    : 'text-gray-600 hover:text-black'
                )}
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
