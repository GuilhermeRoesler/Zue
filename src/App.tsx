import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, User, Search, MessageCircle, ArrowRight, Filter, Phone, Mail, MapPin } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCatalog from './components/ProductCatalog';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import NewsletterPopup from './components/NewsletterPopup';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [showNewsletter, setShowNewsletter] = useState(false);

  useEffect(() => {
    // Show newsletter popup after 3 seconds
    const timer = setTimeout(() => {
      setShowNewsletter(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'home':
        return <Hero onNavigate={setCurrentSection} />;
      case 'catalog':
        return <ProductCatalog />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return <Hero onNavigate={setCurrentSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header currentSection={currentSection} onNavigate={setCurrentSection} />
      
      <main>
        {renderCurrentSection()}
      </main>

      <Footer onNavigate={setCurrentSection} />
      <WhatsAppButton />
      
      {showNewsletter && (
        <NewsletterPopup onClose={() => setShowNewsletter(false)} />
      )}
    </div>
  );
}

export default App;