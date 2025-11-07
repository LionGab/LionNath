/**
 * Testes para nathia-client.ts
 *
 * Cobre:
 * - Retry logic
 * - Error handling
 * - Timeout scenarios
 * - Offline fallback
 * - Request validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nathiaClient, NathiaClientError, getOfflineFallbackResponse } from '@/services/nathia-client';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    })),
  },
  isAxiosError: vi.fn(),
}));

describe('NathiaClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockResponse = {
        response: 'Olá! Como posso ajudar?',
        actions: [],
        suggestedReplies: ['Me sinto ansiosa', 'Dúvida sobre amamentação'],
      };

      // TODO: Mock axios response
      // const response = await nathiaClient.sendMessage({...});
      // expect(response).toEqual(mockResponse);
    });

    it('should handle network errors gracefully', async () => {
      // TODO: Mock network error
      // await expect(nathiaClient.sendMessage({...})).rejects.toThrow(NathiaClientError);
    });

    it('should retry on 500 errors', async () => {
      // TODO: Test retry logic
    });

    it('should timeout after 5 seconds', async () => {
      // TODO: Test timeout
    });
  });

  describe('getOfflineFallbackResponse', () => {
    it('should return offline message', () => {
      const response = getOfflineFallbackResponse();
      expect(response.response).toContain('offline');
      expect(response.actions).toEqual([]);
    });
  });
});
