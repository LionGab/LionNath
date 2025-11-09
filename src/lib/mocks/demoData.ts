/**
 * Dados Mockados para Demo
 *
 * Dados estáticos usados quando USE_MOCKS=true
 */

export const DEMO_CREDENTIALS = {
  email: 'demo@demo.com',
  password: 'Demo1234',
};

export const DEMO_USER_ID = 'demo-user-123';

export const DEMO_PROFILE = {
  id: DEMO_USER_ID,
  name: 'Maria Silva',
  email: 'demo@demo.com',
  type: 'gestante' as const,
  pregnancy_week: 20,
};
