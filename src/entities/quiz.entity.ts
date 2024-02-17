import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn
} from "typeorm";
import { Set } from "./set.entity";
import { QuizQuestion } from "./quiz-question.entity";
import { User } from "./user.entity";

@Entity()
export class Quiz {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	// Indicating which user created the quiz
	@ManyToOne(() => User, (user) => user.quizzes)
	user: User;

	// Indicating to which set quiz belongs
	@ManyToOne(() => Set, (set) => set.quizzes)
	set: Set;

	@CreateDateColumn()
	createdAt: Date;

	// You might want to store results, score, or progress here
	@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
	score?: number;

	// Quiz can have many quiz questions
	@OneToMany(() => QuizQuestion, (question) => question.quiz, { cascade: true})
	questions: QuizQuestion[];
}
