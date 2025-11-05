/**
 * GameWebView Component - Componente para renderizar jogos via WebView no React Native
 */

import React, { useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { GameInitConfig } from '../game-engine';

export interface GameWebViewProps {
  /** Configuração de inicialização do jogo */
  config?: GameInitConfig;
  /** Callback quando o jogo está pronto */
  onReady?: () => void;
  /** Callback de erro */
  onError?: (error: Error) => void;
  /** Callback de progresso de carregamento */
  onProgress?: (progress: number) => void;
  /** URL do HTML do jogo (opcional) */
  gameUrl?: string;
  /** Estilo customizado */
  style?: any;
}

/**
 * Componente GameWebView para React Native
 * Renderiza o jogo Pixi.js dentro de uma WebView
 */
export const GameWebView: React.FC<GameWebViewProps> = ({
  config,
  onReady,
  onError,
  onProgress,
  gameUrl,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const webViewRef = useRef<WebView>(null);

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case 'ready':
          onReady?.();
          setIsLoading(false);
          break;
        case 'error':
          const error = new Error(message.error);
          setError(error);
          onError?.(error);
          setIsLoading(false);
          break;
        case 'progress':
          onProgress?.(message.progress);
          break;
      }
    } catch (err) {
      console.error('Erro ao processar mensagem do WebView:', err);
    }
  };

  const htmlContent = generateGameHTML(config);

  if (Platform.OS === 'web') {
    // No web, usar GameView diretamente
    return (
      <View style={style}>
        {/* Importar e usar GameView no web */}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={gameUrl ? { uri: gameUrl } : { html: htmlContent }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        originWhitelist={['*']}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          const error = new Error(`WebView error: ${nativeEvent.description}`);
          setError(error);
          onError?.(error);
          setIsLoading(false);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
        }}
      />
      {isLoading && <View style={styles.loadingOverlay} />}
      {error && <View style={styles.errorOverlay} />}
    </View>
  );
};

/**
 * Gerar HTML para o jogo no WebView
 */
const generateGameHTML = (config?: GameInitConfig): string => {
  const width = config?.width || 800;
  const height = config?.height || 600;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      background: #000;
      touch-action: none;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    #loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-family: Arial, sans-serif;
    }
  </style>
</head>
<body>
  <div id="loading">Carregando jogo...</div>
  <div id="game-container"></div>
  <script src="https://pixijs.download/release/pixi.min.js"></script>
  <script>
    (async function() {
      try {
        const container = document.getElementById('game-container');
        const loading = document.getElementById('loading');
        
        // Inicializar Pixi.js
        const app = new PIXI.Application();
        await app.init({
          width: ${width},
          height: ${height},
          backgroundColor: 0x1099bb,
          resolution: window.devicePixelRatio || 1,
        });
        
        container.appendChild(app.canvas);
        loading.style.display = 'none';
        
        // Enviar mensagem de ready para React Native
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ready'
          }));
        }
        
        // Exemplo de jogo simples
        const graphics = new PIXI.Graphics();
        graphics.circle(100, 100, 50);
        graphics.fill(0xff0000);
        app.stage.addChild(graphics);
        
        // Animar
        app.ticker.add(() => {
          graphics.rotation += 0.01;
        });
        
      } catch (error) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            error: error.message
          }));
        }
      }
    })();
  </script>
</body>
</html>
  `;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
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
});
