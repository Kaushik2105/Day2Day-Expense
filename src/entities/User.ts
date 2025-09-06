import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';
import { Month } from './Month.js';
import type { Month as MonthType } from './Month.js';

@Entity({ name: 'users' })
export class User {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column({ length: 80 })
	name!: string;

	@Column({ unique: true })
	email!: string;

	@Column()
	passwordHash!: string;

	@OneToMany(() => Month, (month: Month) => month.user)
	months!: MonthType[];

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}


