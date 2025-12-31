import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore - Clappr pode não ter tipos definidos
import Clappr from 'clappr';
import StaticNoise from './StaticNoise';

interface PlayerProps {
  url: string;
  volume: number;
  isMuted: boolean;
  onLoading?: (isLoading: boolean) => void;
  onError?: (msg: string) => void;
}

const Player: React.FC<PlayerProps> = ({ url, volume, isMuted, onLoading, onError }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Efeito principal para instanciar o Clappr
  useEffect(() => {
    // Resetar estados
    setHasError(false);
    onLoading?.(true);

    // Limpar instância anterior se existir
    if (playerInstanceRef.current) {
      playerInstanceRef.current.destroy();
      playerInstanceRef.current = null;
    }

    if (!playerContainerRef.current) return;

    // Configuração do Watchdog (Cão de Guarda)
    // Se o Clappr não começar a tocar em 25 segundos, mostra "Sem Sinal"
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = setTimeout(() => {
      console.warn("Clappr: Timeout de carregamento.");
      setHasError(true);
      onLoading?.(false);
    }, 25000);

    // Instanciando o Clappr com configurações otimizadas para IPTV
    const player = new Clappr.Player({
      source: url,
      parentId: playerContainerRef.current,
      autoPlay: true,
      width: '100%',
      height: '100%',
      // Interface
      chromeless: true, // Remove UI padrão
      disableVideoTagContextMenu: true, // Remove menu de botão direito
      mute: isMuted,
      
      // Configurações de Reprodução HLS
      playback: {
        hlsjsConfig: {
          // Otimizações para Live Stream
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          // Configurações agressivas de retry para streams instáveis
          manifestLoadingTimeOut: 20000,
          manifestLoadingMaxRetry: 6,
          manifestLoadingRetryDelay: 500,
          
          levelLoadingTimeOut: 20000,
          levelLoadingMaxRetry: 6,
          levelLoadingRetryDelay: 500,
          
          fragLoadingTimeOut: 30000,
          fragLoadingMaxRetry: 6,
          fragLoadingRetryDelay: 500,
          
          // Tenta iniciar mesmo se o primeiro segmento falhar
          startFragPrefetch: true,
        }
      },
      events: {
        onReady: () => {
          console.log("Clappr: Pronto");
          player.setVolume(volume);
        },
        onPlay: () => {
          console.log("Clappr: Reproduzindo");
          onLoading?.(false);
          setHasError(false);
          if (watchdogRef.current) clearTimeout(watchdogRef.current);
        },
        onBuffer: () => {
          // Só mostra loading se não estivermos já em erro
          if (!hasError) onLoading?.(true);
        },
        onBufferFull: () => {
          onLoading?.(false);
        },
        onError: (e: any) => {
          console.error("Clappr Error:", e);
          // Pequeno delay antes de mostrar erro para permitir tentativas internas de reconexão do HLS.js
          // Se o erro for fatal, o watchdog eventualmente pegaria, mas aqui aceleramos o feedback visual
          setTimeout(() => {
             // Verificamos se o player recuperou sozinho antes de mostrar erro
             if (!player.isPlaying()) {
                setHasError(true);
                onLoading?.(false);
                if (onError) onError("Falha na reprodução do canal.");
             }
          }, 3000);
        }
      }
    });

    playerInstanceRef.current = player;

    // Cleanup ao desmontar
    return () => {
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
    };
  }, [url]);

  // Controle de Volume e Mute dinâmico
  useEffect(() => {
    const player = playerInstanceRef.current;
    if (player) {
      player.setVolume(volume);
      if (isMuted) {
        player.mute();
      } else {
        player.unmute();
      }
    }
  }, [volume, isMuted]);

  return (
    <div className="absolute inset-0 bg-black -z-10 overflow-hidden">
      {/* Container onde o Clappr injetará o vídeo */}
      <div 
        ref={playerContainerRef} 
        className={`w-full h-full transition-opacity duration-500 ${hasError ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {/* Camada de Chuvisco (TV Noise) - Aparece se houver erro */}
      {hasError && <StaticNoise />}
    </div>
  );
};

export default Player;