import { CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Set } from "./set.entity";
import { TrueFalseQuestion } from "./true-false-question.entity";
import { MatchingQuestion } from "./matching-question.entity";
import { WritingQuestion } from "./writing-question.entity";
import { QuizQuestion } from "./quiz-question.entity";

@Entity()
export class Exam {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => User, (user) => user.exams)
	user: User;

	@ManyToOne(() => Set, (set) => set.exams)
	set: Set;

	@CreateDateColumn()
	createdAt: Date;

	@OneToMany(() => TrueFalseQuestion, (question) => question.exam, { cascade: true })
	trueFalseQuestions: TrueFalseQuestion[];

	@OneToMany(() => MatchingQuestion, (question) => question.exam, { cascade: true })
	matchingQuestions: MatchingQuestion[];

	@OneToMany(() => WritingQuestion, (question) => question.exam, { cascade: true })
	writingQuestions: WritingQuestion[];

	@OneToMany(() => QuizQuestion, (question) => question.exam, { cascade: true })
	quizQuestions: QuizQuestion[];
}
