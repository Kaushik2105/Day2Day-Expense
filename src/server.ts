import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeDataSource } from './data-source.js';
import authRoutes from './routes/auth.js';
import financeRoutes from './routes/finance.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
	res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api', financeRoutes);

const port = Number(process.env.PORT ?? 5175);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../dist-client');
app.use(express.static(clientDist));
// Fallback for client-side routing (exclude API routes)
app.get(/^(?!\/api).*/, (_req, res) => {
	res.sendFile(path.join(clientDist, 'index.html'));
});

initializeDataSource()
	.then(async () => {
		if (process.env.AUTO_MIGRATE === 'true') {
			const { AppDataSource } = await import('./data-source.js');
			await AppDataSource.runMigrations();
		}
		app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
	})
	.catch((err) => {
		console.error('Failed to initialize data source', err);
		process.exit(1);
	});


