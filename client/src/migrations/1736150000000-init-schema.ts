import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1736150000000 implements MigrationInterface {
	name = 'InitSchema1736150000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "users" (
			"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
			"email" character varying NOT NULL UNIQUE,
			"passwordHash" character varying NOT NULL,
			"createdAt" TIMESTAMP NOT NULL DEFAULT now(),
			"updatedAt" TIMESTAMP NOT NULL DEFAULT now()
		)`);
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "months" (
			"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
			"year" integer NOT NULL,
			"month" integer NOT NULL,
			"salary" numeric(12,2) NOT NULL DEFAULT 0,
			"userId" uuid NOT NULL,
			"createdAt" TIMESTAMP NOT NULL DEFAULT now(),
			"updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
			CONSTRAINT unique_user_month UNIQUE ("userId", "year", "month"),
			CONSTRAINT fk_month_user FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
		)`);
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "expenses" (
			"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
			"category" character varying NOT NULL,
			"amount" numeric(12,2) NOT NULL,
			"note" character varying,
			"date" date NOT NULL,
			"monthId" uuid NOT NULL,
			"createdAt" TIMESTAMP NOT NULL DEFAULT now(),
			"updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
			CONSTRAINT fk_expense_month FOREIGN KEY ("monthId") REFERENCES "months"("id") ON DELETE CASCADE
		)`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('DROP TABLE IF EXISTS "expenses"');
		await queryRunner.query('DROP TABLE IF EXISTS "months"');
		await queryRunner.query('DROP TABLE IF EXISTS "users"');
	}
}


