import { Router } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { loginSchema, registerSchema } from '../validators.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
	try {
		const parse = registerSchema.safeParse(req.body);
		if (!parse.success) return res.status(400).json({ errors: parse.error.issues });
		const { name, email, password } = parse.data;
		const repo = AppDataSource.getRepository(User);
		const existing = await repo.findOne({ where: { email } });
		if (existing) return res.status(409).json({ message: 'Email already in use' });
		const passwordHash = await bcrypt.hash(password, 10);
		const user = repo.create({ name, email, passwordHash });
		await repo.save(user);
		const token = signToken({ userId: user.id });
		return res.json({ token });
	} catch (err) {
		console.error('Register failed', err);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const parse = loginSchema.safeParse(req.body);
		if (!parse.success) return res.status(400).json({ errors: parse.error.issues });
		const { email, password } = parse.data;
		const repo = AppDataSource.getRepository(User);
		const user = await repo.findOne({ where: { email } });
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
		const token = signToken({ userId: user.id });
		return res.json({ token });
	} catch (err) {
		console.error('Login failed', err);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

export default router;

router.get('/me', requireAuth, async (req, res) => {
	const repo = AppDataSource.getRepository(User);
	const user = await repo.findOne({ where: { id: (req as any).userId } });
	if (!user) return res.status(404).json({ message: 'Not found' });
	return res.json({ id: user.id, name: user.name, email: user.email });
});


