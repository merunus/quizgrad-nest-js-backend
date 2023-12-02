import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Word } from "./word.entity";

@Entity()
export class Set {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 100 })
	name: string;

	@Column({ length: 50 })
	language: string;

	// Relationship with User
	@ManyToOne(() => User, (user) => user.sets)
	user: User;

	// Relationship with Word
	@ManyToMany(() => Word)
	@JoinTable() // This decorator is required for the owner side of a many-to-many relation
	words: Word[];
}
