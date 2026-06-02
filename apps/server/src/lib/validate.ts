import { GraphQLError } from 'graphql';

export const BILLING_CYCLES = [
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'BI_ANNUAL',
  'YEARLY',
] as const;

export const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const;

export const NET_WORTH_ENTRY_TYPES = ['ASSET', 'LIABILITY'] as const;

export function validateAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new GraphQLError('Amount must be a non-negative number', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
}

export function validateDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new GraphQLError(`Invalid date: "${dateString}"`, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  return date;
}

export function validateMaxLength(
  value: string,
  field: string,
  maxLength: number
): void {
  if (value.length > maxLength) {
    throw new GraphQLError(
      `${field} must be ${maxLength} characters or fewer`,
      { extensions: { code: 'BAD_USER_INPUT' } }
    );
  }
}

export function validateEnum<T extends string>(
  value: string,
  allowed: ReadonlyArray<T>,
  field: string
): T {
  if (!allowed.includes(value as T)) {
    throw new GraphQLError(`${field} must be one of: ${allowed.join(', ')}`, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  return value as T;
}

export function validateUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new GraphQLError('Invalid URL format', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new GraphQLError('URL must use http or https scheme', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
}

export function clampPage(
  page: number,
  pageSize: number
): {
  clampedPage: number;
  clampedPageSize: number;
} {
  return {
    clampedPage: Math.max(page, 1),
    clampedPageSize: Math.min(Math.max(pageSize, 1), 100),
  };
}
