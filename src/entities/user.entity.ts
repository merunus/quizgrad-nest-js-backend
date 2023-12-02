import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Set } from "./set.entity";

@Entity()
export class User {
	// This decorator is used to define the primary key of the table, which will be auto-generated (usually an incrementing ID).
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	email: string;

	@Column()
	username: string;

	@Column()
	password: string; // password hash here

	// Relationship with Set
	@OneToMany(() => Set, (set) => set.user)
	sets: Set[];
}
