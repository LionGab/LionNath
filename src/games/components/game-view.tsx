/**
 * GameView Component - Componente React para encapsular jogos Pixi.js
 * Funciona tanto no Web quanto no React Native usando WebView
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { GameInitConfig } from '../game-engine';

export interface GameViewProps {
  /** Configuração de inicialização do jogo */
  config?: GameInitConfig;
  /** Callback quando o jogo está pronto */
  onReady?: () => void;
  /** Callback de erro */
  onError?: (error: Error) => void;
  /** Callback de progresso de carregamento */
  onProgress?: (progress: number) => void;
  /** Estilo customizado */
  style?: any;
}

/**
 * Componente GameView
 * 
 * No Web: renderiza canvas diretamente usando Pixi.js
 * No Mobile: usa WebView para renderizar o jogo HTML
 */
export const GameView: React.FC<GameViewProps> = ({
  config,
  onReady,
  onError,
  onProgress,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameEngineRef = useRef<any>(null);

  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    if (Platform.OS === 'web') {
      initWebGame();
    } else {
      // No mobile, por enquanto mostramos uma mensagem
      // Em produção, você pode usar WebView ou expo-gl
      setError(new Error('Jogos Pixi.js requerem WebView no mobile. Use GameWebView component.'));
      setIsLoading(false);
    }

    return () => {
      // Cleanup
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy?.();
      }
    };
  }, []);

  const initWebGame = async () => {
    try {
      // Importar dinamicamente apenas no web
      const { GameEngine } = await import('../game-engine');
      const { GameplayScene } = await import('../scenes/gameplay-scene');

      const gameEngine = new GameEngine();
      await gameEngine.init({
        width,
        height,
        ...config,
      });

      gameEngineRef.current = gameEngine;

      // Adicionar canvas ao DOM
      const container = document.getElementById('game-container');
      if (container) {
        container.appendChild(gameEngine.getCanvas());
        onReady?.();
        setIsLoading(false);
      } else {
        throw new Error('Container não encontrado');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao inicializar jogo');
      setError(error);
      onError?.(error);
      setIsLoading(false);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <div id="game-container" ref={containerRef} style={styles.webContainer} />
        {isLoading && <View style={styles.loadingOverlay} />}
        {error && <View style={styles.errorOverlay} />}
      </View>
    );
  }

  // React Native - mostrar mensagem informativa
  return (
    <View style={[styles.container, style]}>
      <View style={styles.mobilePlaceholder}>
        {/* Para mobile, use GameWebView component */}
      </View>
      {error && <View style={styles.errorOverlay} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webContainer: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  mobilePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
