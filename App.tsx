import React, { useState } from 'react';
import SolarSystem from './components/SolarSystem';
import UIOverlay from './components/UIOverlay';
import { BodyType, CelestialInfo } from './types';
import { PLANET_DATA } from './constants';

const App: React.FC = () => {
  const [selectedBody, setSelectedBody] = useState<CelestialInfo | null>(null);
  const [menuSelection, setMenuSelection] = useState<CelestialInfo | null>(null);
  const [isAstroMenuOpen, setIsAstroMenuOpen] = useState(false);

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
    <div className="relative w-full h-screen bg-[#050714] overflow-hidden">
      {/* 3D Scene Container */}
      <div className="absolute inset-0 z-0">
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
          className="fixed inset-0 z-0 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsAstroMenuOpen(false)}
        />
      )}
      <div className="fixed inset-x-0 bottom-4 z-10 flex flex-col items-start px-4 md:absolute md:bottom-6 md:left-6 md:inset-x-auto md:px-0">
        {/* Mobile Bottom Sheet */}
        {isAstroMenuOpen && (
          <div className="mb-3 w-full rounded-2xl border border-white/10 bg-black/70 p-3 backdrop-blur-md shadow-2xl md:hidden">
            <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-white/30" />
            <div className="max-h-[60vh] overflow-y-auto pr-1">
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
      </div>
    </div>
  );
};

export default App;
