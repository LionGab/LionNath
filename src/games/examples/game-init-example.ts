/**
 * Exemplo de uso do Game Engine
 * 
 * Este arquivo demonstra como inicializar e usar o sistema de jogos
 */

import { GameEngine } from './game-engine';
import { GameplayScene } from './scenes/gameplay-scene';

/**
 * Exemplo de inicialização básica
 */
export const initGameExample = async (): Promise<void> => {
  const gameEngine = new GameEngine();

  try {
    // Inicializar engine
    await gameEngine.init({
      width: 800,
      height: 600,
      backgroundColor: 0x1099bb,
      useWebGPU: true,
    });

    // Adicionar canvas ao DOM
    const canvas = gameEngine.getCanvas();
    document.body.appendChild(canvas);

    // Criar e definir cena
    const app = gameEngine.getApplication();
    const gameplayScene = new GameplayScene(app);
    await gameEngine.setScene(gameplayScene);

    console.log('Jogo inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar jogo:', error);
    throw error;
  }
};

/**
 * Exemplo de inicialização com assets progressivos
 */
export const initGameWithProgress = async (
  onProgress: (progress: number) => void
): Promise<void> => {
  const gameEngine = new GameEngine();

  await gameEngine.init();

  const canvas = gameEngine.getCanvas();
  document.body.appendChild(canvas);

  const app = gameEngine.getApplication();
  const gameplayScene = new GameplayScene(app);

  // Carregar assets antes de iniciar a cena
  // (isso seria feito dentro da cena, mas é um exemplo)
  await gameEngine.setScene(gameplayScene);

  onProgress(1.0);
};
