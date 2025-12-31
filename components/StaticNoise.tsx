
import React from 'react';

const StaticNoise: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden flex items-center justify-center">
      {/* Base Noise Layer */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen">
        <svg className="w-full h-full">
           <filter id="noiseFilter">
             <feTurbulence 
               type="fractalNoise" 
               baseFrequency="0.85" 
               numOctaves="3" 
               stitchTiles="stitch" />
           </filter>
           <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Animated Noise Simulation via CSS Keyframes inside style tag */}
      <style>{`
        @keyframes static-anim {
          0% { transform: translate(0,0); }
          10% { transform: translate(-5%,-5%); }
          20% { transform: translate(-10%,5%); }
          30% { transform: translate(5%,-10%); }
          40% { transform: translate(-5%,15%); }
          50% { transform: translate(-10%,5%); }
          60% { transform: translate(15%,0); }
          70% { transform: translate(0,10%); }
          80% { transform: translate(-15%,0); }
          90% { transform: translate(10%,5%); }
          100% { transform: translate(5%,0); }
        }
        .static-overlay {
          animation: static-anim 0.5s steps(5) infinite;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className="absolute inset-[-50%] w-[200%] h-[200%] static-overlay opacity-30"></div>
      
      {/* Texto de Sem Sinal Retro */}
      <div className="z-10 bg-blue-900/80 backdrop-blur px-8 py-4 rounded-lg border-2 border-white/20 shadow-2xl animate-pulse">
        <h2 className="text-4xl font-bold tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          SEM SINAL
        </h2>
      </div>
    </div>
  );
};

export default StaticNoise;
