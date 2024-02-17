import { ArrayMinSize, IsArray, IsNotEmpty, IsString, IsUUID, ValidateNested } from "class-validator";
import { QuizQuestionAnswerDto } from "./quiz-question-answer-dto";
import { Type } from "class-transformer";

export class QuizSubmitDto {
	@IsUUID()
	quizId: string;

	@IsArray()
	@ArrayMinSize(2)
	@ValidateNested({ each: true })
	@Type(() => QuizQuestionAnswerDto)
	questionsAnswers: QuizQuestionAnswerDto[];
}
