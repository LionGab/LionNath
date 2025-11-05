/**
 * Storage Manager - Adaptado para React Native (AsyncStorage) e Web (localStorage)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SAVE_CONFIG } from '../constants/game-config';
import type { GameSaveState } from '../types/game-types';

/**
 * Classe para gerenciar salvamento de dados do jogo
 * Funciona tanto em React Native quanto no Web
 */
export class StorageManager {
  private static instance: StorageManager;

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Salvar estado do jogo
   */
  async save(state: GameSaveState): Promise<void> {
    try {
      const data = JSON.stringify(state);
      await AsyncStorage.setItem(SAVE_CONFIG.STORAGE_KEY, data);
    } catch (error) {
      console.error('Erro ao salvar estado do jogo:', error);
      throw error;
    }
  }

  /**
   * Carregar estado do jogo
   */
  async load(): Promise<GameSaveState | null> {
    try {
      const data = await AsyncStorage.getItem(SAVE_CONFIG.STORAGE_KEY);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as GameSaveState;
    } catch (error) {
      console.error('Erro ao carregar estado do jogo:', error);
      return null;
    }
  }

  /**
   * Limpar estado salvo
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SAVE_CONFIG.STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar estado do jogo:', error);
    }
  }

  /**
   * Verificar se há save state
   */
  async hasSaveState(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(SAVE_CONFIG.STORAGE_KEY);
      return data !== null;
    } catch {
      return false;
    }
  }
}
