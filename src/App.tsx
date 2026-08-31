import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CatalogCarousel from './components/CatalogCarousel';
import About from './components/About';
import Footer from './components/Footer';
import HibernateOverlay from './components/HibernateOverlay';
import UpdatePrompt from './components/UpdatePrompt';
import { isNativeApp } from './lib/kiosk';
import { IDLE_TIMEOUT_MS } from './lib/idle-config';
import { useIdle } from './hooks/use-idle';
import {
  type AvailableUpdate,
  scheduleUpdateCheck,
} from './lib/app-update';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [availableUpdate, setAvailableUpdate] = useState<AvailableUpdate | null>(
    null
  );
  const nativeApp = isNativeApp();
  const isHibernating = useIdle(IDLE_TIMEOUT_MS);

  const isCatalog = currentSection === 'catalog';

  useEffect(() => {
    if (!nativeApp) return;
    scheduleUpdateCheck(setAvailableUpdate);
  }, [nativeApp]);

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'home':
        return <Hero />;
      case 'about':
        return <About />;
      case 'catalog':
        return null;
      default:
        return <Hero />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {!isCatalog && (
        <>
          <Header currentSection={currentSection} onNavigate={setCurrentSection} />
          <main>{renderCurrentSection()}</main>
          <Footer onNavigate={setCurrentSection} />
        </>
      )}

      {isCatalog && (
        <CatalogCarousel
          paused={isHibernating}
          onNavigateHome={() => setCurrentSection('home')}
        />
      )}

      <HibernateOverlay visible={isHibernating} />

      {availableUpdate && (
        <UpdatePrompt
          update={availableUpdate}
          onClose={() => setAvailableUpdate(null)}
        />
      )}
    </div>
  );
}

export default App;
