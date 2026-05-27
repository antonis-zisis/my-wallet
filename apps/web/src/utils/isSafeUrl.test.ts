import { describe, expect, it } from 'vitest';

import { isSafeUrl } from './isSafeUrl';

describe('isSafeUrl', () => {
  describe('when given a valid https URL', () => {
    it('returns true', () => {
      expect(isSafeUrl('https://example.com')).toBe(true);
    });

    it('returns true for URLs with paths and query strings', () => {
      expect(isSafeUrl('https://example.com/path?foo=bar')).toBe(true);
    });
  });

  describe('when given a valid http URL', () => {
    it('returns true', () => {
      expect(isSafeUrl('http://example.com')).toBe(true);
    });
  });

  describe('when given a javascript: URL', () => {
    it('returns false', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    });
  });

  describe('when given a data: URL', () => {
    it('returns false', () => {
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });
  });

  describe('when given a ftp: URL', () => {
    it('returns false', () => {
      expect(isSafeUrl('ftp://example.com')).toBe(false);
    });
  });

  describe('when given a relative URL', () => {
    it('returns false', () => {
      expect(isSafeUrl('/relative/path')).toBe(false);
    });
  });

  describe('when given an empty string', () => {
    it('returns false', () => {
      expect(isSafeUrl('')).toBe(false);
    });
  });

  describe('when given a plain string that is not a URL', () => {
    it('returns false', () => {
      expect(isSafeUrl('not a url at all')).toBe(false);
    });
  });
});
