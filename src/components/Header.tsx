import { useState } from 'react';
import { Menu, ShoppingBag, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface HeaderProps {
  currentSection: string;
  onNavigate: (section: string) => void;
}

const navigationItems = [
  { id: 'home', label: 'Início' },
  { id: 'catalog', label: 'Catálogo' },
  { id: 'about', label: 'Sobre' },
  { id: 'contact', label: 'Contato' },
];

const Header = ({ currentSection, onNavigate }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

          <nav className="hidden space-x-8 md:flex">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'h-auto rounded-none border-b px-0 pb-0.5 text-sm font-light tracking-wide hover:bg-transparent',
                  currentSection === item.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                )}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="hidden items-center space-x-2 md:flex">
            <Button variant="ghost" size="icon" className="rounded-none text-gray-600 hover:bg-transparent hover:text-black">
              <Search className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-none text-gray-600 hover:bg-transparent hover:text-black">
              <User className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-none text-gray-600 hover:bg-transparent hover:text-black">
              <ShoppingBag className="size-5" />
            </Button>
          </div>

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
                      'h-auto w-full justify-start rounded-none px-0 text-lg font-light tracking-wide hover:bg-transparent',
                      currentSection === item.id ? 'text-black' : 'text-gray-600'
                    )}
                  >
                    {item.label}
                  </Button>
                ))}
                <Separator className="bg-gray-100" />
                <div className="flex items-center space-x-2 pt-2">
                  <Button variant="ghost" size="icon" className="rounded-none text-gray-600 hover:bg-transparent">
                    <Search className="size-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-none text-gray-600 hover:bg-transparent">
                    <User className="size-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-none text-gray-600 hover:bg-transparent">
                    <ShoppingBag className="size-5" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
