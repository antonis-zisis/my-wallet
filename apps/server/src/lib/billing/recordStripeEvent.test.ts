import { beforeEach, describe, expect, it, vi } from 'vitest';

import { forgetStripeEvent, recordStripeEvent } from './recordStripeEvent';

vi.mock('../prisma', () => ({
  default: { stripeEvent: { create: vi.fn(), deleteMany: vi.fn() } },
}));

let prisma: typeof import('../prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../prisma')).default;
});

const event = { id: 'evt_1', type: 'customer.subscription.updated' };

describe('recordStripeEvent', () => {
  it('accepts an event it has not seen before', async () => {
    vi.mocked(prisma.stripeEvent.create).mockResolvedValue({
      id: 'evt_1',
      type: event.type,
      createdAt: new Date(),
    });

    await expect(recordStripeEvent(event)).resolves.toBe(true);
  });

  it('rejects a redelivery of the same event', async () => {
    vi.mocked(prisma.stripeEvent.create).mockRejectedValue(
      Object.assign(new Error('unique constraint'), { code: 'P2002' })
    );

    await expect(recordStripeEvent(event)).resolves.toBe(false);
  });

  it('surfaces any other database failure', async () => {
    vi.mocked(prisma.stripeEvent.create).mockRejectedValue(
      Object.assign(new Error('connection lost'), { code: 'P1001' })
    );

    await expect(recordStripeEvent(event)).rejects.toThrow('connection lost');
  });
});

describe('forgetStripeEvent', () => {
  it('removes the record so a retry is treated as new', async () => {
    vi.mocked(prisma.stripeEvent.deleteMany).mockResolvedValue({ count: 1 });

    await forgetStripeEvent('evt_1');

    expect(prisma.stripeEvent.deleteMany).toHaveBeenCalledWith({
      where: { id: 'evt_1' },
    });
  });
});
