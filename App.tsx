import React, { useEffect, useRef, useState } from 'react';
import SolarSystem from './components/SolarSystem';
import UIOverlay from './components/UIOverlay';
import DisclaimerModal from './components/DisclaimerModal';
import { BodyType, CelestialInfo } from './types';
import { PLANET_DATA } from './constants';

const DISCLAIMER_STORAGE_KEY = 'sistema-solar-disclaimer-v1';
const DISCLAIMER_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

const App: React.FC = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [selectedBody, setSelectedBody] = useState<CelestialInfo | null>(null);
  const [menuSelection, setMenuSelection] = useState<CelestialInfo | null>(null);
  const [isAstroMenuOpen, setIsAstroMenuOpen] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isManualFullscreen, setIsManualFullscreen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const handleBodySelect = (body: CelestialInfo) => {
    setSelectedBody(body);
  };

  const handleClearSelect = () => {
    setSelectedBody(null);
  };

  const handleAstroSelect = (body: CelestialInfo) => {
    setSelectedBody(body);
    setMenuSelection(body);
    setIsAstroMenuOpen(false);
  };

  useEffect(() => {
    const fullDiv = document.querySelector<HTMLElement>('.full-div');
    const root = rootRef.current;

    if (fullDiv && root) {
      fullDiv.style.minHeight = `${root.offsetHeight}px`;
    }
  }, []);

  useEffect(() => {
    const now = Date.now();
    const storedValue = window.localStorage.getItem(DISCLAIMER_STORAGE_KEY);

    if (storedValue) {
      try {
        const parsed = JSON.parse(storedValue) as { expiresAt?: number };
        if (typeof parsed.expiresAt === 'number' && parsed.expiresAt > now) {
          return undefined;
        }
      } catch (_error) {
        // Ignora conteúdo inválido e segue fluxo normal.
      }

      window.localStorage.removeItem(DISCLAIMER_STORAGE_KEY);
    }

    const timeoutId = window.setTimeout(() => {
      setIsDisclaimerOpen(true);
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleCloseDisclaimer = () => {
    setIsDisclaimerOpen(false);
    const now = Date.now();
    const expiresAt = now + DISCLAIMER_TTL_MS;
    window.localStorage.setItem(
      DISCLAIMER_STORAGE_KEY,
      JSON.stringify({ acceptedAt: now, expiresAt }),
    );
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const root = rootRef.current;
      const isRootFullscreen = Boolean(root && document.fullscreenElement === root);

      setIsNativeFullscreen(isRootFullscreen);

      if (isRootFullscreen) {
        setIsManualFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!isManualFullscreen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isManualFullscreen]);

  const handleToggleFullscreen = async () => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const canUseNativeFullscreen =
      typeof root.requestFullscreen === 'function' && typeof document.exitFullscreen === 'function';

    if (canUseNativeFullscreen) {
      try {
        if (document.fullscreenElement === root) {
          await document.exitFullscreen();
        } else {
          await root.requestFullscreen();
        }
        return;
      } catch (_error) {
        // Fallback para modo tela cheia via CSS caso a API não esteja disponível.
      }
    }

    setIsManualFullscreen((value) => !value);
  };

  const isFullscreen = isNativeFullscreen || isManualFullscreen;

  const astroList = (
    <>
      {PLANET_DATA.map((body) => (
        <div key={body.id} className="mb-1 last:mb-0">
          <button
            onClick={() => handleAstroSelect(body)}
            className="w-full rounded-md px-2 py-1 text-left text-sm text-white/90 hover:bg-white/10"
          >
            {body.name}
          </button>
          {body.type === BodyType.PLANET && body.moons && body.moons.length > 0 && (
            <div className="mt-1 space-y-1 pl-4">
              {body.moons.map((moon) => (
                <button
                  key={moon.id}
                  onClick={() => handleAstroSelect(moon)}
                  className="w-full rounded-md px-2 py-1 text-left text-xs text-white/70 hover:bg-white/10"
                >
                  {moon.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );

  return (
    <div
      ref={rootRef}
      className={`sistema-solar-root relative w-full h-full min-h-[600px] bg-[#050714] overflow-hidden ${
        isManualFullscreen ? 'sistema-solar-root--fullscreen' : ''
      }`}
    >
      {/* 3D Scene Container */}
      <div className="sistema-solar-canvas-wrap absolute inset-0 z-0">
        <SolarSystem
          selectedBody={selectedBody}
          menuSelection={menuSelection}
          onMenuSelectionHandled={() => setMenuSelection(null)}
          onBodySelect={handleBodySelect}
          onClearSelect={handleClearSelect}
        />
      </div>

      {/* Static Header / Overlay UI */}
      {!selectedBody && (
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
            <h1 className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">
                Sistema Solar Interativo
            </h1>
            <div className="mt-4 text-xs text-gray-400 max-w-xs bg-black/30 p-3 rounded-lg backdrop-blur-md border border-white/5">
                <p>Clique em um planeta para explorar. Use o mouse para rotacionar e dar zoom.</p>
            </div>
        </div>
      )}

      {/* Info Card Overlay */}
      <UIOverlay 
        data={selectedBody} 
        visible={!!selectedBody} 
        onClose={handleClearSelect} 
      />

      {/* Astros Menu */}
      {isAstroMenuOpen && (
        <div
          className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsAstroMenuOpen(false)}
        />
      )}
      <div className="absolute inset-x-0 bottom-4 z-20 flex flex-col items-start px-4 md:bottom-6 md:left-6 md:right-auto md:px-0">
        {/* Mobile Bottom Sheet */}
        {isAstroMenuOpen && (
          <div className="mb-3 w-full rounded-2xl border border-white/10 bg-black/70 p-3 backdrop-blur-md shadow-2xl md:hidden">
            <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-white/30" />
            <div className="max-h-[60vh] overflow-y-auto pr-3 scrollbar-dark">
              {astroList}
            </div>
          </div>
        )}
        {/* Desktop Popover */}
        {isAstroMenuOpen && (
          <div className="mb-2 w-56 rounded-lg border border-white/10 bg-black/60 p-2 backdrop-blur-md shadow-lg hidden md:block">
            {astroList}
          </div>
        )}
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => setIsAstroMenuOpen((open) => !open)}
            className="rounded-lg border border-white/15 bg-black/60 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md hover:bg-black/70 flex items-center gap-2"
          >
            <span className="inline-flex flex-col gap-1">
              <span className="h-0.5 w-4 rounded bg-white/90" />
              <span className="h-0.5 w-4 rounded bg-white/90" />
              <span className="h-0.5 w-4 rounded bg-white/90" />
            </span>
            Astros
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="sistema-solar-fullscreen-toggle inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-black/60 text-white shadow-lg backdrop-blur-md hover:bg-black/70"
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
          >
            {isFullscreen ? (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 3L10 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M10 4V10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M4 10H10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M21 3L14 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M14 4V10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M14 10H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M3 21L10 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M10 14V20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M4 14H10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M21 21L14 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M14 14V20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M14 14H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M10 10L3 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M3 3V9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M3 3H9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M14 10L21 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M21 3V9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M15 3H21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M10 14L3 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M3 15V21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M3 21H9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M14 14L21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M21 15V21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M15 21H21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={handleCloseDisclaimer}
      />
    </div>
  );
};

export default App;
