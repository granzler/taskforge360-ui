import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('next-auth', () => ({
  default: vi.fn(),
}));

const noop = () => {};
Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });