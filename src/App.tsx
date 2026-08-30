import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCatalog from './components/ProductCatalog';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import NewsletterPopup from './components/NewsletterPopup';
import { isNativeApp } from './lib/kiosk';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [showNewsletter, setShowNewsletter] = useState(false);
  const nativeApp = isNativeApp();

  useEffect(() => {
    // Na vitrine (app nativo) o popup atrapalha o uso contínuo no tablet
    if (nativeApp) {
      return;
    }

    const timer = setTimeout(() => {
      setShowNewsletter(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [nativeApp]);

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
    <div className="min-h-screen bg-background">
      <Header currentSection={currentSection} onNavigate={setCurrentSection} />

      <main>{renderCurrentSection()}</main>

      <Footer onNavigate={setCurrentSection} />
      {!nativeApp && <WhatsAppButton />}

      {showNewsletter && <NewsletterPopup onClose={() => setShowNewsletter(false)} />}
    </div>
  );
}

export default App;
