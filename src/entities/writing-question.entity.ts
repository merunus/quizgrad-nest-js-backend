import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Exam } from "./exam.entity";

@Entity()
export class WritingQuestion {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => Exam, (exam) => exam.writingQuestions)
	exam: Exam;

	@Column()
	prompt: string;

	@Column()
	correctAnswer: string;
}
