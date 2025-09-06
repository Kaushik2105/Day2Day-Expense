import { z } from 'zod';

export const registerSchema = z.object({
	name: z.string().min(2).max(80),
	email: z.string().email(),
	password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export const setSalarySchema = z.object({
	year: z.number().int().gte(2000).lte(3000),
	month: z.number().int().gte(1).lte(12),
	salary: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

export const addExpenseSchema = z.object({
	year: z.number().int().gte(2000).lte(3000),
	month: z.number().int().gte(1).lte(12),
	category: z.string().min(1).max(50),
	amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
	note: z.string().max(200).optional(),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});


