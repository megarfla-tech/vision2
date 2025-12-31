
import React, { useEffect, useRef } from 'react';
import { Channel, Category } from '../types';

interface ChannelListProps {
  categories: Category[];
  activeChannel: Channel | null;
  onSelect: (channel: Channel) => void;
  isOpen: boolean;
}

const ChannelList: React.FC<ChannelListProps> = ({ categories, activeChannel, onSelect, isOpen }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && activeChannel) {
      // Pequeno delay para garantir que o DOM renderizou antes do scroll
      setTimeout(() => {
        const activeEl = document.getElementById(`list-item-${activeChannel.id}`);
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          activeEl.focus();
        }
      }, 150);
    }
  }, [isOpen, activeChannel]);

  return (
    <div 
      className={`fixed inset-y-0 left-0 w-[420px] bg-black/95 backdrop-blur-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] border-r border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Cabeçalho */}
        <div className="pt-10 pb-6 px-8 bg-gradient-to-b from-zinc-900 to-transparent">
          <h2 className="text-3xl font-bold text-white tracking-tight">Canais</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Ao Vivo • {categories.length} Categorias</p>
          </div>
        </div>

        {/* Lista Scrollável */}
        <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-8" ref={scrollRef}>
          {categories.map((cat) => (
            <div key={cat.name} className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h3 className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm py-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 pl-2 border-l-2 border-blue-500">
                {cat.name}
              </h3>
              <div className="space-y-1.5">
                {cat.channels.map((ch) => (
                  <button
                    key={ch.id}
                    id={`list-item-${ch.id}`}
                    onClick={() => onSelect(ch)}
                    className={`
                      w-full group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 outline-none
                      border border-transparent
                      focus:bg-white focus:text-black focus:scale-[1.02] focus:shadow-2xl focus:z-10
                      hover:bg-white/10
                      ${activeChannel?.id === ch.id ? 'bg-white/10 border-white/10' : ''}
                    `}
                  >
                    {/* Número do Canal */}
                    <span className={`font-mono text-sm font-bold opacity-60 group-focus:text-black/60 ${activeChannel?.id === ch.id ? 'text-blue-400' : 'text-zinc-500'}`}>
                      {String(ch.number).padStart(3, '0')}
                    </span>
                    
                    {/* Logo ou Ícone Placeholder */}
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 group-focus:bg-zinc-200">
                       {ch.logo ? (
                         <img src={ch.logo} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                       ) : (
                         <span className="text-[10px] text-zinc-500 group-focus:text-black font-bold">TV</span>
                       )}
                    </div>

                    {/* Nome do Canal */}
                    <span className="flex-1 text-left text-sm font-medium text-zinc-300 group-focus:text-black truncate leading-tight">
                      {ch.name}
                    </span>
                    
                    {/* Indicador Ativo */}
                    {activeChannel?.id === ch.id && (
                      <div className="absolute right-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] group-focus:bg-black" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChannelList;
