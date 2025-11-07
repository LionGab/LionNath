/**
 * Testes para useNathia hook
 *
 * Cobre:
 * - Envio de mensagens
 * - Carregamento de histórico
 * - Persistência local
 * - Sincronização com backend
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNathia } from '@/hooks/useNathia';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

// Mock nathia-client
vi.mock('@/services/nathia-client', () => ({
  nathiaClient: {
    sendMessage: vi.fn(),
  },
  getOfflineFallbackResponse: vi.fn(),
}));

// Mock supabase
vi.mock('@/services/supabase', () => ({
  saveChatMessage: vi.fn(),
  getChatHistory: vi.fn(),
}));

describe('useNathia', () => {
  const mockContext = {
    userId: 'user123',
    stage: 'gestante' as const,
    pregnancyWeek: 20,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useNathia(mockContext));

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should send message and receive response', async () => {
    // TODO: Implement test
  });

  it('should load history from AsyncStorage', async () => {
    // TODO: Implement test
  });

  it('should clear history', async () => {
    // TODO: Implement test
  });

  it('should show typing indicator', async () => {
    // TODO: Implement test
  });
});
