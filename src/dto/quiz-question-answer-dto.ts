import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class QuizQuestionAnswerDto {
	@IsUUID()
	questionId: string;
	
	@IsString()
	@IsNotEmpty()
	userAnswer: string;
}
