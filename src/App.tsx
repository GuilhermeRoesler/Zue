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
import { cn } from './lib/utils';

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
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev;
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
            loading={catalog.loading}
            error={catalog.error}
            paused={mediaSheetOpen}
            onExpandChange={handleCatalogExpandChange}
            onOpenMediaFolder={() => setMediaSheetOpen(true)}
          />
        );
      default:
        return <Hero />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {!nativeApp && <CustomCursor />}

      {/* Header/Footer ficam montados; só desliga interação no expand */}
      <div
        className={cn(catalogFullscreen && 'pointer-events-none')}
        aria-hidden={catalogFullscreen || undefined}
      >
        <Header
          currentSection={currentSection}
          onNavigate={setCurrentSection}
          onLogoLongPress={
            isCatalog ? () => setMediaSheetOpen(true) : undefined
          }
        />
      </div>

      <main>{renderCurrentSection()}</main>

      <div
        className={cn(catalogFullscreen && 'pointer-events-none')}
        aria-hidden={catalogFullscreen || undefined}
      >
        <Footer onNavigate={setCurrentSection} />
      </div>

      <MediaFolderSheet
        open={mediaSheetOpen}
        onOpenChange={setMediaSheetOpen}
        source={catalog.source}
        folderLabel={catalog.folderLabel}
        slideCount={catalog.slides.length}
        collectionCount={catalog.collections.length}
        sort={catalog.sort}
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
        onSortChange={(next) => {
          void catalog.setSort(next);
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
