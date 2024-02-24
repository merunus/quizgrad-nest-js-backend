import { Module } from "@nestjs/common";
import { ExamService } from "./exam.service";
import { ExamController } from "./exam.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Exam } from "src/entities/exam.entity";
import { User } from "src/entities/user.entity";
import { QuizQuestion } from "src/entities/quiz-question.entity";
import { WritingQuestion } from "src/entities/writing-question.entity";
import { TrueFalseQuestion } from "src/entities/true-false-question.entity";
import { MatchingQuestion } from "src/entities/matching-question.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Exam,
			User,
			QuizQuestion,
			WritingQuestion,
			TrueFalseQuestion,
			MatchingQuestion
		])
	],
	providers: [ExamService],
	controllers: [ExamController]
})
export class ExamModule {}
