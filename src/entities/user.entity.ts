import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from "typeorm";
import { Set } from "./set.entity";
import { Quiz } from "./quiz.entity";

@Entity()
export class User {
	// This decorator is used to define the primary key of the table, which will be auto-generated (usually an incrementing ID).
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	email: string;

	@Column()
	username: string;

	@Column()
	password: string; // password hash here

	// Relationship with Set
	@OneToMany(() => Set, (set) => set.user)
	sets: Set[];

	// Avatar image
	@Column({ nullable: true })
	avatarUrl: string;

	@CreateDateColumn()
	createdAt: Date;

	// One user can take many quizzes.
	@OneToMany(() => Quiz, (quiz) => quiz.user)
	quizzes: Quiz[];
}
