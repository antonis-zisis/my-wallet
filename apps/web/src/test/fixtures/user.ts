import { User } from '../../contexts/UserContext';

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    currency: 'EUR',
    email: 'user@example.com',
    fullName: 'John Doe',
    role: 'USER',
    supabaseId: 'supabase-user-1',
    ...overrides,
  };
}
