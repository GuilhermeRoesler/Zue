import React, { useState } from 'react';
import { Menu, X, ShoppingBag, User, Search } from 'lucide-react';

interface HeaderProps {
  currentSection: string;
  onNavigate: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentSection, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Início' },
    { id: 'catalog', label: 'Catálogo' },
    { id: 'about', label: 'Sobre' },
    { id: 'contact', label: 'Contato' },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="shrink-0">
              <button 
                onClick={() => onNavigate('home')}
                className="text-2xl font-light tracking-widest text-black hover:text-gray-600 transition-colors duration-300"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                ZUE
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`text-sm font-light tracking-wide transition-colors duration-300 ${
                    currentSection === item.id
                      ? 'text-black border-b border-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center space-x-6">
              <Search className="w-5 h-5 text-gray-600 hover:text-black cursor-pointer transition-colors duration-300" />
              <User className="w-5 h-5 text-gray-600 hover:text-black cursor-pointer transition-colors duration-300" />
              <ShoppingBag className="w-5 h-5 text-gray-600 hover:text-black cursor-pointer transition-colors duration-300" />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-black transition-colors duration-300"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 absolute top-16 left-0 right-0 z-40">
          <div className="px-4 py-6 space-y-4">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left text-lg font-light tracking-wide transition-colors duration-300 ${
                  currentSection === item.id ? 'text-black' : 'text-gray-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
              <Search className="w-5 h-5 text-gray-600" />
              <User className="w-5 h-5 text-gray-600" />
              <ShoppingBag className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;