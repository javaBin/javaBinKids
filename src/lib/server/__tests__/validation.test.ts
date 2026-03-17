import { describe, it, expect } from 'vitest';
import { registrationSchema, eventSchema, courseSchema, loginSchema } from '../validation';

describe('registrationSchema', () => {
	it('accepts valid registration', () => {
		const result = registrationSchema.safeParse({
			parentName: 'Ola Nordmann',
			parentEmail: 'ola@example.com',
			parentPhone: '99887766',
			childName: 'Lille Ola',
			childAge: 8
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid email', () => {
		const result = registrationSchema.safeParse({
			parentName: 'Ola',
			parentEmail: 'not-an-email',
			parentPhone: '99887766',
			childName: 'Lille Ola',
			childAge: 8
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing child name', () => {
		const result = registrationSchema.safeParse({
			parentName: 'Ola',
			parentEmail: 'ola@example.com',
			parentPhone: '99887766',
			childName: '',
			childAge: 8
		});
		expect(result.success).toBe(false);
	});

	it('rejects age below 3', () => {
		const result = registrationSchema.safeParse({
			parentName: 'Ola',
			parentEmail: 'ola@example.com',
			parentPhone: '99887766',
			childName: 'Baby',
			childAge: 2
		});
		expect(result.success).toBe(false);
	});
});

describe('loginSchema', () => {
	it('accepts valid login', () => {
		const result = loginSchema.safeParse({ username: 'admin', password: 'secret' });
		expect(result.success).toBe(true);
	});

	it('rejects empty password', () => {
		const result = loginSchema.safeParse({ username: 'admin', password: '' });
		expect(result.success).toBe(false);
	});
});
