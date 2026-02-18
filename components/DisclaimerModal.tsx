import React from 'react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-sky-100 bg-white p-5 md:p-7 text-slate-800 shadow-[0_24px_60px_rgba(14,116,144,0.28)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar aviso"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-sky-700 transition-colors hover:bg-sky-100"
        >
          X
        </button>

        <h2 id="disclaimer-title" className="mb-4 pr-10 text-xl font-bold text-sky-700 md:text-2xl">
          Aviso Importante
        </h2>

        <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
          <p>
            Este modelo é uma simulação visual educativa. As proporções de tamanho, distância,
            velocidade e escala orbital não são reais.
          </p>
          <p>
            Os valores foram ajustados para manter a navegação clara e tornar a experiência
            visualmente compreensível, preservando o máximo possível de referência didática.
          </p>
          <p>
            O conteúdo tem caráter informativo e não substitui materiais científicos ou acadêmicos
            especializados.
          </p>
          <p className="font-medium">
            Aproveite a experiência e divirta-se na jornada pelo espaço. 🚀✨
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-sky-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-sky-700"
        >
          Entendi
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
