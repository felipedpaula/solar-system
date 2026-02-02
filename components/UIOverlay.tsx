import React, { useEffect, useState } from 'react';
import { CelestialInfo } from '../types';

interface UIOverlayProps {
  data: CelestialInfo | null;
  onClose: () => void;
  visible: boolean;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ data, onClose, visible }) => {
  if (!data) return null;
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsMobileOpen(false);
    }
  }, [visible, data?.id]);

  const mobileTransform = isMobileOpen ? 'translate-y-0' : 'translate-y-[90vh]';
  const desktopTransform = visible ? 'md:translate-x-0' : 'md:translate-x-full';

  return (
    <div 
        className={`absolute bottom-0 left-0 w-full h-full md:h-full md:w-96 md:left-auto md:right-0 bg-black/80 backdrop-blur-md text-white p-6 md:p-8 border-l border-white/10 transition-transform duration-500 ease-in-out z-20 flex flex-col transform ${mobileTransform} ${desktopTransform} md:translate-y-0`}
    >
      {/* Mobile Handle */}
      <div className="md:hidden relative mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {data.name}
        </h2>
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-white/30" />
        <button
          onClick={() => setIsMobileOpen((open) => !open)}
          className="text-xs uppercase tracking-wider text-white/70"
        >
          {isMobileOpen ? 'Minimizar' : 'Abrir'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <h2 className="hidden md:block text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {data.name}
        </h2>
        <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-wider mb-6 uppercase">
            {data.type}
        </span>

        <div className="space-y-6">
            <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Descrição</h3>
                <p className="leading-relaxed text-gray-200">
                    {data.description}
                </p>
            </section>

            <section className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h3 className="text-sm font-bold text-yellow-400 uppercase mb-2 flex items-center gap-2">
                    <span>💡</span> Curiosidade
                </h3>
                <p className="text-sm italic text-gray-300">
                    "{data.funFact}"
                </p>
            </section>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/5 p-3 rounded">
                    <span className="block text-gray-400 text-xs">Velocidade Orbital</span>
                    <span className="font-mono text-lg">{data.speed}x</span>
                </div>
                <div className="bg-white/5 p-3 rounded">
                    <span className="block text-gray-400 text-xs">Rotação</span>
                    <span className="font-mono text-lg">{data.rotationSpeed} rad/s</span>
                </div>
            </div>
        </div>
      </div>

      <button 
        onClick={onClose}
        className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/20"
      >
        Voltar à Visão Geral
      </button>
    </div>
  );
};

export default UIOverlay;
