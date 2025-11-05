/**
 * GameScreen - Screen de exemplo para jogos
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Screen } from '@/shared/components/Screen';
import { Loading } from '@/shared/components/Loading';
import { GameView } from '../components/game-view';
import { GameWebView } from '../components/game-web-view';
import { colors } from '@/theme/colors';

/**
 * Screen de exemplo para demonstrar integração de jogos
 */
export const GameScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handleReady = () => {
    setIsLoading(false);
    console.log('Jogo pronto!');
  };

  const handleError = (err: Error) => {
    setError(err);
    setIsLoading(false);
    console.error('Erro no jogo:', err);
  };

  const handleProgress = (progress: number) => {
    console.log(`Progresso: ${Math.round(progress * 100)}%`);
  };

  return (
    <Screen edges={['top', 'bottom']} loading={isLoading} loadingMessage="Carregando jogo...">
      <View style={styles.container}>
        {Platform.OS === 'web' ? (
          <GameView
            config={{
              width: 800,
              height: 600,
              backgroundColor: 0x1099bb,
            }}
            onReady={handleReady}
            onError={handleError}
            onProgress={handleProgress}
            style={styles.gameView}
          />
        ) : (
          <GameWebView
            config={{
              width: 800,
              height: 600,
              backgroundColor: 0x1099bb,
            }}
            onReady={handleReady}
            onError={handleError}
            onProgress={handleProgress}
            style={styles.gameView}
          />
        )}
        {error && <View style={styles.errorContainer} />}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gameView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.error,
    opacity: 0.1,
  },
});
