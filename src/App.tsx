import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CatalogPage from './components/CatalogPage';
import About from './components/About';
import Footer from './components/Footer';
import HibernateOverlay from './components/HibernateOverlay';
import MediaFolderSheet from './components/MediaFolderSheet';
import UpdatePrompt from './components/UpdatePrompt';
import CustomCursor from './components/CustomCursor';
import { isNativeApp } from './lib/kiosk';
import { IDLE_TIMEOUT_MS } from './lib/idle-config';
import { useIdle } from './hooks/use-idle';
import { useCatalogSlides } from './hooks/use-catalog-slides';
import { useLenis } from './hooks/use-lenis';
import {
  type AvailableUpdate,
  scheduleUpdateCheck,
} from './lib/app-update';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [availableUpdate, setAvailableUpdate] = useState<AvailableUpdate | null>(
    null
  );
  const [mediaSheetOpen, setMediaSheetOpen] = useState(false);
  const [catalogFullscreen, setCatalogFullscreen] = useState(false);
  const nativeApp = isNativeApp();
  const isHibernating = useIdle(IDLE_TIMEOUT_MS);
  const catalog = useCatalogSlides();

  const isCatalog = currentSection === 'catalog';

  useLenis(!catalogFullscreen && !isHibernating && !mediaSheetOpen);

  useEffect(() => {
    if (!catalogFullscreen) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
    };
  }, [catalogFullscreen]);

  useEffect(() => {
    if (!nativeApp) return;
    scheduleUpdateCheck(setAvailableUpdate);
  }, [nativeApp]);

  useEffect(() => {
    if (!isCatalog) setCatalogFullscreen(false);
  }, [isCatalog]);

  const handleCatalogExpandChange = useCallback((expanded: boolean) => {
    setCatalogFullscreen(expanded);
  }, []);

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'home':
        return <Hero />;
      case 'about':
        return <About />;
      case 'catalog':
        return (
          <CatalogPage
            collections={catalog.collections}
            paused={mediaSheetOpen}
            onExpandChange={handleCatalogExpandChange}
          />
        );
      default:
        return <Hero />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {!nativeApp && <CustomCursor />}

      {!catalogFullscreen && (
        <Header
          currentSection={currentSection}
          onNavigate={setCurrentSection}
          onLogoLongPress={
            isCatalog ? () => setMediaSheetOpen(true) : undefined
          }
        />
      )}

      <main className={catalogFullscreen ? 'contents' : undefined}>
        {renderCurrentSection()}
      </main>

      {!catalogFullscreen && <Footer onNavigate={setCurrentSection} />}

      <MediaFolderSheet
        open={mediaSheetOpen}
        onOpenChange={setMediaSheetOpen}
        source={catalog.source}
        folderLabel={catalog.folderLabel}
        slideCount={catalog.slides.length}
        loading={catalog.loading}
        error={catalog.error}
        onPickFolder={() => {
          void catalog.pickFolder();
        }}
        onUseDemo={() => {
          void catalog.useDemo();
        }}
        onRefresh={() => {
          void catalog.refresh();
        }}
      />

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
