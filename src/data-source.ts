import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const dbHost = process.env.DB_HOST ?? 'localhost';
const dbPort = Number(process.env.DB_PORT ?? '5432');
const dbUser = process.env.DB_USER ?? 'postgres';
const dbPassword = process.env.DB_PASSWORD ?? 'baba';
const dbName = process.env.DB_NAME ?? 'day2day_expense';

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: dbHost,
	port: dbPort,
	username: dbUser,
	password: dbPassword,
	database: dbName,
	synchronize: false,
	logging: false,
	entities: [path.join(path.dirname(fileURLToPath(import.meta.url)), 'entities/*.{ts,js}')],
	migrations: [path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations/*.{ts,js}')],
});

export async function initializeDataSource() {
	if (AppDataSource.isInitialized) return AppDataSource;
	await AppDataSource.initialize();
	return AppDataSource;
}


