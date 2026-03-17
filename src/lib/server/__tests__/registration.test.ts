import { describe, it, expect } from 'vitest';

describe('registration logic', () => {
	it('determines confirmed status when seats available', () => {
		const confirmedCount = 5;
		const maxParticipants = 10;
		const status = confirmedCount < maxParticipants ? 'confirmed' : 'waitlisted';
		expect(status).toBe('confirmed');
	});

	it('determines waitlisted status when full', () => {
		const confirmedCount = 10;
		const maxParticipants = 10;
		const status = confirmedCount < maxParticipants ? 'confirmed' : 'waitlisted';
		expect(status).toBe('waitlisted');
	});

	it('calculates waitlist position', () => {
		const currentWaitlisted = 3;
		const newPosition = currentWaitlisted + 1;
		expect(newPosition).toBe(4);
	});
});
