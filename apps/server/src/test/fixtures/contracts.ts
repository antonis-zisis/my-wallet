import { Contract } from '../../generated/prisma/client';

export function makeContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: 'contract-1',
    category: 'Electricity',
    provider: 'DEI',
    plan: 'MyHome Online',
    startDate: new Date('2025-01-01T00:00:00Z'),
    endDate: new Date('2027-01-01T00:00:00Z'),
    cost: null,
    userId: 'user-1',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  };
}
