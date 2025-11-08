/**
 * Testes para ChatMessage component
 *
 * Cobre:
 * - Renderização user/assistant
 * - Actions rendering
 * - Feedback buttons
 * - Acessibilidade
 * - Formatação de timestamp
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatMessage } from '@/components/nathia/ChatMessage';
import { Message } from '@/hooks/useNathia';

describe('ChatMessage', () => {
  const mockUserMessage: Message = {
    id: '1',
    role: 'user',
    content: 'Olá!',
    timestamp: new Date('2025-01-15T10:00:00Z'),
  };

  const mockAssistantMessage: Message = {
    id: '2',
    role: 'assistant',
    content: 'Olá! Como posso ajudar?',
    timestamp: new Date('2025-01-15T10:00:05Z'),
    actions: [
      {
        type: 'openScreen',
        label: 'Ver plano diário',
        data: { screenName: 'dailyPlan' },
      },
    ],
  };

  it('should render user message correctly', () => {
    const { getByText } = render(<ChatMessage message={mockUserMessage} />);
    expect(getByText('Olá!')).toBeTruthy();
  });

  it('should render assistant message with actions', () => {
    const onActionPress = vi.fn();
    const { getByText } = render(<ChatMessage message={mockAssistantMessage} onActionPress={onActionPress} />);

    expect(getByText('Olá! Como posso ajudar?')).toBeTruthy();
    expect(getByText('Ver plano diário')).toBeTruthy();
  });

  it('should call onActionPress when action is pressed', () => {
    const onActionPress = vi.fn();
    const { getByText } = render(<ChatMessage message={mockAssistantMessage} onActionPress={onActionPress} />);

    fireEvent.press(getByText('Ver plano diário'));
    expect(onActionPress).toHaveBeenCalledWith(mockAssistantMessage.actions![0]);
  });

  it('should show feedback buttons for assistant messages', () => {
    const onFeedback = vi.fn();
    const { getByA11yLabel } = render(<ChatMessage message={mockAssistantMessage} onFeedback={onFeedback} />);

    const thumbsUp = getByA11yLabel('Feedback positivo');
    const thumbsDown = getByA11yLabel('Feedback negativo');

    expect(thumbsUp).toBeTruthy();
    expect(thumbsDown).toBeTruthy();
  });

  it('should be accessible', () => {
    const { getByA11yRole } = render(<ChatMessage message={mockUserMessage} />);
    expect(getByA11yRole('text')).toBeTruthy();
  });
});
