import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Quiz } from "./quiz.entity";

@Entity()
export class QuizQuestion {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	// Each quiz question is part of one quiz.
	@ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: "CASCADE" })
	quiz: Quiz; // Reference to the quiz this question belongs to

	@Column()
	question: string;

	@Column("text", { array: true })
	options: string[];

	@Column()
	correctAnswer: string;

	@Column({ nullable: true })
	userAnswer?: string;
}
