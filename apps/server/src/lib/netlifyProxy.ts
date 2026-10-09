import { createHmac, timingSafeEqual } from 'node:crypto';
import type { IncomingHttpHeaders } from 'node:http';
import { isIP } from 'node:net';

import { z } from 'zod';

const SIGNATURE_HEADER = 'x-nf-sign';
const CLIENT_IP_HEADER = 'x-nf-client-connection-ip';

const jwsHeaderSchema = z.object({ alg: z.literal('HS256') });
const claimsSchema = z.object({
  iss: z.literal('netlify'),
  exp: z.number(),
});

type ProxiedClientIpInput = {
  headers: IncomingHttpHeaders;
  secret: string | undefined;
  nowSeconds: number;
};

function decodeJson(segment: string): unknown {
  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function hasValidSignature(token: string, secret: string, nowSeconds: number) {
  const segments = token.split('.');

  if (segments.length !== 3) {
    return false;
  }

  const [header, payload, signature] = segments;
  const expected = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest();
  const actual = Buffer.from(signature, 'base64url');

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return false;
  }

  const claims = claimsSchema.safeParse(decodeJson(payload));

  return (
    jwsHeaderSchema.safeParse(decodeJson(header)).success &&
    claims.success &&
    claims.data.exp > nowSeconds
  );
}

// the client IP header is only trusted when Netlify signed the request, since anyone can set it on a direct call
export function proxiedClientIp({
  headers,
  nowSeconds,
  secret,
}: ProxiedClientIpInput): string | null {
  const token = headers[SIGNATURE_HEADER];
  const clientIp = headers[CLIENT_IP_HEADER];

  if (
    !secret ||
    typeof token !== 'string' ||
    typeof clientIp !== 'string' ||
    isIP(clientIp) === 0
  ) {
    return null;
  }

  return hasValidSignature(token, secret, nowSeconds) ? clientIp : null;
}
