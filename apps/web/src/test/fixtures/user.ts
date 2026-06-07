import { User } from '../../contexts/UserContext';

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@example.com',
    fullName: 'John Doe',
    ...overrides,
  };
}
