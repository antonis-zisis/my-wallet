import { User } from '../../contexts/UserContext';
import { makePlanEntitlements } from './plan';

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    currency: 'EUR',
    email: 'user@example.com',
    entitlements: makePlanEntitlements(),
    fullName: 'John Doe',
    plan: 'PRO',
    supabaseId: 'supabase-user-1',
    ...overrides,
  };
}
