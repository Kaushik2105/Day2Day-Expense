import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addExpenseSchema, setSalarySchema } from '../validators.js';
import { AppDataSource } from '../data-source.js';
import { Month } from '../entities/Month.js';
import { Expense } from '../entities/Expense.js';

const router = Router();

router.use(requireAuth);

router.post('/salary', async (req, res) => {
	const parse = setSalarySchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ errors: parse.error.issues });
	const { year, month, salary } = parse.data;
	const userId = (req as any).userId as string;
	const monthRepo = AppDataSource.getRepository(Month);
	let m = await monthRepo.findOne({ where: { year, month, user: { id: userId } }, relations: ['user'] });
	if (!m) {
		m = monthRepo.create({ year, month, salary, user: { id: userId } as any });
	} else {
		m.salary = salary;
	}
	await monthRepo.save(m);
	return res.json({ message: 'Salary saved' });
});

router.post('/expenses', async (req, res) => {
	const parse = addExpenseSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ errors: parse.error.issues });
	const { year, month, category, amount, note, date } = parse.data;
	const userId = (req as any).userId as string;
	const monthRepo = AppDataSource.getRepository(Month);
	let m = await monthRepo.findOne({ where: { year, month, user: { id: userId } }, relations: ['user'] });
	if (!m) {
		m = monthRepo.create({ year, month, salary: '0', user: { id: userId } as any });
		await monthRepo.save(m);
	}
	const expenseRepo = AppDataSource.getRepository(Expense);
	const exp = expenseRepo.create({ month: m, category, amount, note: note ?? undefined, date });
	await expenseRepo.save(exp);
	return res.json({ message: 'Expense added' });
});

router.get('/expenses', async (req, res) => {
	const userId = (req as any).userId as string;
	const { year, month } = req.query as any;
	const y = Number(year);
	const m = Number(month);
	if (!y || !m) return res.status(400).json({ message: 'year and month required' });
	const monthRepo = AppDataSource.getRepository(Month);
	const expenseRepo = AppDataSource.getRepository(Expense);
	const monthRow = await monthRepo.findOne({ where: { year: y, month: m, user: { id: userId } } });
	if (!monthRow) return res.json([]);
	const exps = await expenseRepo.find({ where: { month: { id: monthRow.id } }, order: { date: 'DESC' } });
	return res.json(exps);
});

router.get('/months', async (req, res) => {
	const userId = (req as any).userId as string;
	const monthRepo = AppDataSource.getRepository(Month);
	const months = await monthRepo.find({ where: { user: { id: userId } }, order: { year: 'DESC', month: 'DESC' } });
	return res.json(months);
});

router.get('/summary', async (req, res) => {
	const userId = (req as any).userId as string;
	const { year, month } = req.query as any;
	const y = Number(year);
	const m = Number(month);
	if (!y || !m) return res.status(400).json({ message: 'year and month required' });
	const monthRepo = AppDataSource.getRepository(Month);
	const expenseRepo = AppDataSource.getRepository(Expense);
	const monthRow = await monthRepo.findOne({ where: { year: y, month: m, user: { id: userId } } });
	if (!monthRow) return res.json({ salary: '0.00', totalExpenses: '0.00', balance: '0.00' });
	const exps = await expenseRepo.find({ where: { month: { id: monthRow.id } } });
	const total = exps.reduce((acc, e) => acc + Number(e.amount), 0);
	const salaryNum = Number(monthRow.salary);
	const balance = salaryNum - total;
	return res.json({ salary: monthRow.salary, totalExpenses: total.toFixed(2), balance: balance.toFixed(2) });
});

router.delete('/expenses/:id', async (req, res) => {
	const userId = (req as any).userId as string;
	const id = req.params.id;
	const expenseRepo = AppDataSource.getRepository(Expense);
	const exp = await expenseRepo.findOne({ where: { id }, relations: ['month', 'month.user'] });
	if (!exp || exp.month.user.id !== userId) return res.status(404).json({ message: 'Not found' });
	await expenseRepo.delete(id);
	return res.json({ message: 'Deleted' });
});

export default router;


