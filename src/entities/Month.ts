import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
	Unique,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from './User.js';
import { Expense } from './Expense.js';
import type { User as UserType } from './User.js';
import type { Expense as ExpenseType } from './Expense.js';

@Entity({ name: 'months' })
@Unique(['user', 'year', 'month'])
export class Month {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@ManyToOne(() => User, (user: User) => user.months, { onDelete: 'CASCADE' })
	user!: UserType;

	@Column()
	year!: number; // e.g., 2025

	@Column()
	month!: number; // 1-12

	@Column('decimal', { precision: 12, scale: 2, default: 0 })
	salary!: string; // store as string to keep precision

	@OneToMany(() => Expense, (expense: Expense) => expense.month)
	expenses!: ExpenseType[];

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}


