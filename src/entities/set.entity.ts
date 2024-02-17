import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn
} from "typeorm";
import { User } from "./user.entity";
import { Word } from "./word.entity";
import { Quiz } from "./quiz.entity";

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
	@OneToMany(() => Word, (word) => word.set, { cascade: true })
	words: Word[];

	@CreateDateColumn()
	createdAt: Date;

	// One set can be associated with many quizzes
	@OneToMany(() => Quiz, (quiz) => quiz.set, { cascade: true })
	quizzes: Quiz[];
}
