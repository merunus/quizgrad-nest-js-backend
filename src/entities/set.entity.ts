import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn
} from "typeorm";
import { User } from "./user.entity";
import { Word } from "./word.entity";

@Entity()
export class Set {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ length: 100 })
	name: string;

	@Column({ length: 50 })
	language: string;

	// Relationship with User
	// Indicates that each set belongs to one user
	@ManyToOne(() => User, (user) => user.sets, { onDelete: "CASCADE" }) // When a user who created set deleted - delete set
	user: User;

	// Relationship with Word
	// Indicates that set can contain many words
	@ManyToMany(() => Word)
	@JoinTable() // This decorator is required for the owner side of a many-to-many relation
	words: Word[];

	@CreateDateColumn()
	createdAt: Date;
}
