import { beforeEach, describe, expect, it, vi } from 'vitest';

const { constructEvent, retrieveSubscription } = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  retrieveSubscription: vi.fn(),
}));

vi.mock('../env', () => ({
  env: { STRIPE_WEBHOOK_SECRET: 'whsec_test' },
}));

vi.mock('../stripe', () => ({
  stripe: {
    webhooks: { constructEvent },
    subscriptions: { retrieve: retrieveSubscription },
  },
  requireStripe: () => ({
    webhooks: { constructEvent },
    subscriptions: { retrieve: retrieveSubscription },
  }),
}));

vi.mock('../prisma', () => ({
  default: {
    stripeEvent: { create: vi.fn() },
    user: { updateMany: vi.fn() },
  },
}));

import { handleStripeWebhook } from './handleStripeWebhook';

let prisma: typeof import('../prisma').default;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../prisma')).default;
  vi.mocked(prisma.stripeEvent.create).mockResolvedValue({
    id: 'evt_1',
    type: 'customer.subscription.updated',
    createdAt: new Date(),
  });
  vi.mocked(prisma.user.updateMany).mockResolvedValue({ count: 1 });
});

const payload = Buffer.from('{}');

const subscriptionEvent = {
  id: 'evt_1',
  type: 'customer.subscription.updated',
  data: {
    object: {
      id: 'sub_123',
      customer: 'cus_123',
      status: 'active',
      cancel_at_period_end: false,
      items: { data: [{ current_period_end: 1790000000 }] },
    },
  },
};

describe('handleStripeWebhook', () => {
  it('rejects a request with no signature without touching the database', async () => {
    const result = await handleStripeWebhook({ payload, signature: undefined });

    expect(result.status).toBe(400);
    expect(prisma.stripeEvent.create).not.toHaveBeenCalled();
  });

  it('rejects a payload whose signature does not verify', async () => {
    constructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature');
    });

    const result = await handleStripeWebhook({ payload, signature: 'bad' });

    expect(result).toEqual({
      status: 400,
      body: { error: 'Invalid signature' },
    });
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it('never echoes the verification failure back to the caller', async () => {
    constructEvent.mockImplementation(() => {
      throw new Error('secret whsec_test did not match');
    });

    const result = await handleStripeWebhook({ payload, signature: 'bad' });

    expect(JSON.stringify(result.body)).not.toContain('whsec_test');
  });

  it('applies a verified subscription event', async () => {
    constructEvent.mockReturnValue(subscriptionEvent);

    const result = await handleStripeWebhook({ payload, signature: 'good' });

    expect(result).toEqual({ status: 200, body: { received: true } });
    expect(prisma.user.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { stripeCustomerId: 'cus_123' } })
    );
  });

  it('ignores a redelivered event instead of applying it twice', async () => {
    constructEvent.mockReturnValue(subscriptionEvent);
    vi.mocked(prisma.stripeEvent.create).mockRejectedValue(
      Object.assign(new Error('duplicate'), { code: 'P2002' })
    );

    const result = await handleStripeWebhook({ payload, signature: 'good' });

    expect(result).toEqual({
      status: 200,
      body: { received: true, duplicate: true },
    });
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it('marks the account past due when an invoice fails', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_2',
      type: 'invoice.payment_failed',
      data: { object: { customer: 'cus_123' } },
    });

    await handleStripeWebhook({ payload, signature: 'good' });

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_123' },
      data: { planStatus: 'PAST_DUE' },
    });
  });

  it('looks the subscription up when checkout completes', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_3',
      type: 'checkout.session.completed',
      data: { object: { subscription: 'sub_123' } },
    });
    retrieveSubscription.mockResolvedValue(subscriptionEvent.data.object);

    await handleStripeWebhook({ payload, signature: 'good' });

    expect(retrieveSubscription).toHaveBeenCalledWith('sub_123');
    expect(prisma.user.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { stripeCustomerId: 'cus_123' } })
    );
  });

  it('passes an unhandled event through without writing anything', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_4',
      type: 'payment_intent.succeeded',
      data: { object: {} },
    });

    const result = await handleStripeWebhook({ payload, signature: 'good' });

    expect(result.status).toBe(200);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });
});
