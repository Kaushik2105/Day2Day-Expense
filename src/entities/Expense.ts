import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Month } from './Month.js';
import type { Month as MonthType } from './Month.js';

@Entity({ name: 'expenses' })
export class Expense {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@ManyToOne(() => Month, (month: Month) => month.expenses, { onDelete: 'CASCADE' })
	month!: MonthType;

	@Column()
	category!: string; // e.g., Food, Rent, Utilities, etc.

	@Column('decimal', { precision: 12, scale: 2 })
	amount!: string; // store as string to keep precision

	@Column({ type: 'text', nullable: true })
	note?: string | undefined;

	@Column({ type: 'date' })
	date!: string; // yyyy-mm-dd

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}


