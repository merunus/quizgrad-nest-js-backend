import { Module } from "@nestjs/common";
import { QuizQuestionService } from "./quiz-question.service";

@Module({
	providers: [QuizQuestionService]
})
export class QuizQuestionModule {}
