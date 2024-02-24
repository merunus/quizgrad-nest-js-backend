import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Quiz } from "./quiz.entity";
import { Exam } from "./exam.entity";

@Entity()
export class QuizQuestion {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	// Each quiz question is part of one quiz.
	@ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: "CASCADE", nullable: true })
	quiz?: Quiz; // Reference to the quiz this question belongs to

	@ManyToOne(() => Exam, (exam) => exam.quizQuestions, { onDelete: "CASCADE", nullable: true })
	exam?: Exam; // Reference to the exam this question belongs to

	@Column()
	question: string;

	@Column("text", { array: true })
	options: string[];

	@Column()
	correctAnswer: string;

	@Column({ nullable: true })
	userAnswer?: string;
}
