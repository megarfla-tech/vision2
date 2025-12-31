
import React from 'react';
import { Channel } from '../types';

interface ZappingOverlayProps {
  channel: Channel;
  isVisible: boolean;
}

const ZappingOverlay: React.FC<ZappingOverlayProps> = ({ channel, isVisible }) => {
  return (
    <div 
      className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1) ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
    >
      {/* Gradiente suave */}
      <div className="bg-gradient-to-t from-black via-black/90 to-transparent pt-32 pb-16 px-12 md:px-20">
        <div className="flex items-end gap-8">
          
          {/* Logo Grande */}
          <div className="w-32 h-32 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl shrink-0">
            {channel.logo ? (
              <img src={channel.logo} alt="" className="w-24 h-24 object-contain" />
            ) : (
              <span className="text-4xl font-bold text-white/20">{channel.number}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 mb-2">
            <div className="flex items-center gap-4 mb-3">
               <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg shadow-blue-900/40 uppercase tracking-wider">
                 Ao Vivo
               </span>
               <span className="text-zinc-400 text-sm font-semibold uppercase tracking-widest flex items-center gap-2">
                 <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                 {channel.group || 'Geral'}
               </span>
               <span className="text-zinc-500 text-sm font-medium border border-zinc-800 px-1.5 rounded">HD</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-xl leading-none">
              {channel.name}
            </h1>
            
            <div className="flex items-center gap-4 mt-6">
                <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                   <div className="h-full w-3/4 bg-blue-500/80 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
                <div className="text-zinc-400 font-mono text-xs">
                    00:00 / 24:00
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZappingOverlay;
