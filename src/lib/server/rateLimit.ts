interface RateLimitConfig {
	windowMs: number;
	maxRequests: number;
}

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

export function createRateLimiter(config: RateLimitConfig) {
	const store = new Map<string, RateLimitEntry>();

	return {
		check(ip: string): boolean {
			const now = Date.now();
			const entry = store.get(ip);

			if (!entry || now > entry.resetTime) {
				store.set(ip, { count: 1, resetTime: now + config.windowMs });
				return true;
			}

			entry.count++;
			return entry.count <= config.maxRequests;
		}
	};
}

export const registrationLimiter = createRateLimiter({
	windowMs: 60 * 1000,
	maxRequests: 5
});
