import { createHmac } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { proxiedClientIp } from './netlifyProxy';

const SECRET = 'a-proxy-secret-that-is-long-enough-to-use';
const NOW = 1_790_000_000;
const CLIENT_IP = '203.0.113.7';

type SignOptions = {
  algorithm?: string;
  claims?: Record<string, unknown>;
  secret?: string;
};

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign({
  algorithm = 'HS256',
  claims = { iss: 'netlify', exp: NOW + 60 },
  secret = SECRET,
}: SignOptions = {}) {
  const unsigned = `${encode({ alg: algorithm, typ: 'JWT' })}.${encode(claims)}`;
  const signature = createHmac('sha256', secret)
    .update(unsigned)
    .digest('base64url');

  return `${unsigned}.${signature}`;
}

function signedHeaders(token: string, clientIp = CLIENT_IP) {
  return { 'x-nf-sign': token, 'x-nf-client-connection-ip': clientIp };
}

describe('proxiedClientIp', () => {
  it('returns the client IP from a request Netlify signed', () => {
    const headers = signedHeaders(sign());

    const result = proxiedClientIp({
      headers,
      secret: SECRET,
      nowSeconds: NOW,
    });

    expect(result).toBe(CLIENT_IP);
  });

  it('ignores the client IP header on an unsigned request', () => {
    const headers = { 'x-nf-client-connection-ip': CLIENT_IP };

    const result = proxiedClientIp({
      headers,
      secret: SECRET,
      nowSeconds: NOW,
    });

    expect(result).toBeNull();
  });

  it('rejects a signature made with another secret', () => {
    const headers = signedHeaders(sign({ secret: 'someone-elses-secret' }));

    const result = proxiedClientIp({
      headers,
      secret: SECRET,
      nowSeconds: NOW,
    });

    expect(result).toBeNull();
  });

  it('rejects an expired signature', () => {
    const headers = signedHeaders(
      sign({ claims: { iss: 'netlify', exp: NOW - 1 } })
    );

    const result = proxiedClientIp({
      headers,
      secret: SECRET,
      nowSeconds: NOW,
    });

    expect(result).toBeNull();
  });

  it('rejects a token not issued by Netlify', () => {
    const headers = signedHeaders(
      sign({ claims: { iss: 'elsewhere', exp: NOW + 60 } })
    );

    const result = proxiedClientIp({
      headers,
      secret: SECRET,
      nowSeconds: NOW,
    });

    expect(result).toBeNull();
  });

  it('rejects a token declaring another algorithm', () => {
    const headers = signedHeaders(sign({ algorithm: 'none' }));

    const result = proxiedClientIp({
      headers,
      secret: SECRET,
      nowSeconds: NOW,
    });

    expect(result).toBeNull();
  });

  it('rejects a malformed token', () => {
    const headers = signedHeaders('not.a-token');

    const result = proxiedClientIp({
      headers,
      secret: SECRET,
      nowSeconds: NOW,
    });

    expect(result).toBeNull();
  });

  it('rejects a client IP header that is not an IP address', () => {
    const headers = signedHeaders(sign(), '203.0.113.7, 10.0.0.1');

    const result = proxiedClientIp({
      headers,
      secret: SECRET,
      nowSeconds: NOW,
    });

    expect(result).toBeNull();
  });

  it('trusts nothing when no secret is configured', () => {
    const headers = signedHeaders(sign());

    const result = proxiedClientIp({
      headers,
      secret: undefined,
      nowSeconds: NOW,
    });

    expect(result).toBeNull();
  });
});
