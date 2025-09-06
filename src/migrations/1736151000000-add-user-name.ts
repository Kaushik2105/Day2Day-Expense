import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserName1736151000000 implements MigrationInterface {
	name = 'AddUserName1736151000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "name" character varying(80) NOT NULL DEFAULT ''`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE "users" DROP COLUMN "name"');
	}
}


