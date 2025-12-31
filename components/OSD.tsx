
import React from 'react';

interface OSDProps {
  volume: number;
  showVolume: boolean;
  inputBuffer: string;
}

const OSD: React.FC<OSDProps> = ({ volume, showVolume, inputBuffer }) => {
  return (
    <>
      {/* Entrada Numérica (Canto Superior Direito) */}
      {inputBuffer && (
        <div className="fixed top-10 right-10 z-50 flex flex-col items-end animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="text-6xl font-light text-white drop-shadow-md tracking-tighter">
            {inputBuffer}
          </div>
          <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-1">
            Sintonizando...
          </div>
        </div>
      )}

      {/* Barra de Volume (Lateral Direita) */}
      <div 
        className={`fixed right-8 top-1/2 -translate-y-1/2 bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 z-50 transition-all duration-300 ${
          showVolume ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center gap-4 w-12 h-64">
          <div className="text-white font-bold">{volume}</div>
          <div className="flex-1 w-2 bg-zinc-800 rounded-full relative overflow-hidden flex flex-col justify-end">
            <div 
              className="w-full bg-blue-500 transition-all duration-100"
              style={{ height: `${volume}%` }}
            />
          </div>
          <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {volume === 0 ? (
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            ) : (
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            )}
          </svg>
        </div>
      </div>
    </>
  );
};

export default OSD;
