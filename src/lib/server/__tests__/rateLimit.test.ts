import { describe, it, expect, beforeEach } from 'vitest';
import { createRateLimiter } from '../rateLimit';

describe('createRateLimiter', () => {
	let limiter: ReturnType<typeof createRateLimiter>;

	beforeEach(() => {
		limiter = createRateLimiter({ windowMs: 1000, maxRequests: 3 });
	});

	it('allows requests within limit', () => {
		expect(limiter.check('127.0.0.1')).toBe(true);
		expect(limiter.check('127.0.0.1')).toBe(true);
		expect(limiter.check('127.0.0.1')).toBe(true);
	});

	it('blocks requests over limit', () => {
		limiter.check('127.0.0.1');
		limiter.check('127.0.0.1');
		limiter.check('127.0.0.1');
		expect(limiter.check('127.0.0.1')).toBe(false);
	});

	it('tracks IPs independently', () => {
		limiter.check('127.0.0.1');
		limiter.check('127.0.0.1');
		limiter.check('127.0.0.1');
		expect(limiter.check('127.0.0.2')).toBe(true);
	});
});
