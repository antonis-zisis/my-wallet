import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { describe, expect, it } from 'vitest';

import { getPlanLimitMessage } from './getPlanLimitMessage';

function combinedError(extensions: Record<string, unknown>) {
  return new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'The Free plan is limited to 3 reports.', extensions }],
  });
}

describe('getPlanLimitMessage', () => {
  it('returns the message of a plan-limit error', () => {
    const error = combinedError({ code: 'FORBIDDEN', reason: 'PLAN_LIMIT' });

    expect(getPlanLimitMessage(error)).toBe(
      'The Free plan is limited to 3 reports.'
    );
  });

  it('ignores GraphQL errors that are not about the plan', () => {
    const error = combinedError({ code: 'FORBIDDEN' });

    expect(getPlanLimitMessage(error)).toBeNull();
  });

  it('ignores errors that never reached the server', () => {
    expect(getPlanLimitMessage(new Error('Network request failed'))).toBeNull();
  });
});
