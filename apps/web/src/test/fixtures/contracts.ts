import { Contract } from '../../types/contract';

export function makeContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: 'contract-1',
    category: 'Electricity',
    provider: 'DEI',
    plan: 'MyHome Online',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2027-01-01T00:00:00Z',
    cost: null,
    isExpired: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}
