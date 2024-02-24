import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Exam } from "./exam.entity";

@Entity()
export class MatchingQuestion {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => Exam, (exam) => exam.matchingQuestions)
	exam: Exam;

	@Column("simple-json")
	pairs: { [key: string]: string }; // Key-value pairs to be matched

	@Column("simple-json")
	correctAnswer: { [key: string]: string }; // Correct matching pairs
}
