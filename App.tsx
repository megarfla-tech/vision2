
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Player from './components/Player';
import ChannelList from './components/ChannelList';
import ZappingOverlay from './components/ZappingOverlay';
import OSD from './components/OSD';
import { fetchChannels } from './services/m3uParser';
import { Channel, Category, UIState } from './types';

const App: React.FC = () => {
  // Dados
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Estado do Player
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [volume, setVolume] = useState<number>(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);
  
  // Estado da UI
  const [uiState, setUiState] = useState<UIState>(UIState.LOADING);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showZapping, setShowZapping] = useState(false);
  const [showVolumeOSD, setShowVolumeOSD] = useState(false);
  const [numBuffer, setNumBuffer] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Timers
  const zappingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const numBufferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Wake Lock (Manter tela ligada)
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock ativo!');
        }
      } catch (err) {
        console.warn('Erro ao ativar Wake Lock:', err);
      }
    };

    requestWakeLock();

    // Reativar se a aba voltar a ter foco (ex: usuário minimizou e voltou)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) wakeLock.release();
    };
  }, []);

  // Inicialização
  useEffect(() => {
    const init = async () => {
      try {
        setUiState(UIState.LOADING);
        const data = await fetchChannels();
        if (data.length === 0) throw new Error("A lista de canais está vazia.");
        
        setChannels(data);

        // Agrupar canais
        const groups: Record<string, Channel[]> = {};
        data.forEach(ch => {
          const cat = ch.group || 'Geral';
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(ch);
        });
        const catList: Category[] = Object.entries(groups).map(([name, channels]) => ({ name, channels }));
        setCategories(catList);

        // Recuperar último canal
        const lastId = localStorage.getItem('last_channel_id');
        let initialIndex = 0;
        if (lastId) {
          const idx = data.findIndex(c => c.id === lastId);
          if (idx !== -1) initialIndex = idx;
        }
        
        setCurrentIndex(initialIndex);
        setUiState(UIState.IDLE);
        // Pequeno delay para mostrar a info bar ao iniciar
        setTimeout(() => showInfoBar(), 500);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido");
        setUiState(UIState.ERROR);
      }
    };
    init();
  }, []);

  // Funções de Controle
  const showInfoBar = useCallback(() => {
    setShowZapping(true);
    if (zappingTimerRef.current) clearTimeout(zappingTimerRef.current);
    zappingTimerRef.current = setTimeout(() => setShowZapping(false), 4000);
  }, []);

  const changeChannel = useCallback((index: number) => {
    if (channels.length === 0) return;
    
    // Força loading imediato visualmente para feedback rápido
    setIsPlayerLoading(true);

    let nextIdx = index;
    if (nextIdx < 0) nextIdx = channels.length - 1;
    if (nextIdx >= channels.length) nextIdx = 0;

    // Pequeno timeout para permitir que a UI do React atualize o "Unmount" do player anterior
    requestAnimationFrame(() => {
        setCurrentIndex(nextIdx);
        localStorage.setItem('last_channel_id', channels[nextIdx].id);
        setIsSidebarOpen(false);
        showInfoBar();
    });

  }, [channels, showInfoBar]);

  const updateVolume = useCallback((delta: number) => {
    setVolume(prev => {
      const newVol = Math.max(0, Math.min(100, prev + delta));
      return newVol;
    });
    setIsMuted(false);
    
    setShowVolumeOSD(true);
    if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
    volumeTimerRef.current = setTimeout(() => setShowVolumeOSD(false), 2000);
  }, []);

  // Buffer Numérico
  useEffect(() => {
    if (numBuffer.length > 0) {
      if (numBufferTimerRef.current) clearTimeout(numBufferTimerRef.current);
      numBufferTimerRef.current = setTimeout(() => {
        const targetNum = parseInt(numBuffer);
        const foundIdx = channels.findIndex(c => c.number === targetNum);
        if (foundIdx !== -1) {
          changeChannel(foundIdx);
        }
        setNumBuffer("");
      }, 1500);
    }
  }, [numBuffer, channels, changeChannel]);

  // Event Listener Global (Controle Remoto)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSidebarOpen) {
        if (['Escape', 'Backspace', 'ArrowLeft'].includes(e.key)) {
          setIsSidebarOpen(false);
        }
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        setNumBuffer(prev => prev + e.key);
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'ChannelUp':
          changeChannel(currentIndex + 1);
          break;
        case 'ArrowDown':
        case 'ChannelDown':
          changeChannel(currentIndex - 1);
          break;
        case 'ArrowRight':
        case 'VolumeUp':
          updateVolume(5);
          break;
        case 'ArrowLeft':
        case 'VolumeDown':
          updateVolume(-5);
          break;
        case 'Mute':
          setIsMuted(prev => !prev);
          break;
        case 'Enter':
        case 'OK':
        case 'Select':
        case 'dpad_center':
          if (showZapping) {
             setIsSidebarOpen(true);
          } else {
             showInfoBar();
          }
          break;
        case 'ContextMenu':
        case 'Guide':
        case 'Menu':
           setIsSidebarOpen(prev => !prev);
           break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isSidebarOpen, changeChannel, updateVolume, showZapping, showInfoBar]);

  const activeChannel = channels[currentIndex] || null;

  if (uiState === UIState.LOADING) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative font-sans select-none cursor-none">
      
      {/* Camada de Vídeo + Chuvisco */}
      {activeChannel && (
        <Player 
          key={activeChannel.url} 
          url={activeChannel.url} 
          volume={volume}
          isMuted={isMuted}
          onLoading={setIsPlayerLoading}
          onError={(msg) => console.log(msg)}
        />
      )}

      {/* Camada OSD */}
      <OSD 
        volume={volume} 
        showVolume={showVolumeOSD} 
        inputBuffer={numBuffer} 
      />

      {/* Info Bar */}
      <ZappingOverlay 
        channel={activeChannel!} 
        isVisible={showZapping && !isSidebarOpen} 
      />
      
      {/* Menu Lateral */}
      <ChannelList 
        categories={categories} 
        activeChannel={activeChannel} 
        isOpen={isSidebarOpen}
        onSelect={(ch) => {
          const idx = channels.findIndex(c => c.id === ch.id);
          changeChannel(idx);
        }}
      />

      {/* Loading Spinner (Só aparece se o Player estiver carregando e NÃO estiver com erro/chuvisco) */}
      {isPlayerLoading && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {!isSidebarOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsSidebarOpen(true)} />
      )}
    </div>
  );
};

export default App;
