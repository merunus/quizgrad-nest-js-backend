import { Module, forwardRef } from "@nestjs/common";
import { QuizService } from "./quiz.service";
import { QuizController } from "./quiz.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Quiz } from "src/entities/quiz.entity";
import { QuizQuestion } from "src/entities/quiz-question.entity";
import { SetModule } from "../set/set.module";
import { QuizQuestionModule } from "../quiz-question/quiz-question.module";
import { User } from "src/entities/user.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([Quiz, QuizQuestion, User]),
		forwardRef(() => SetModule),
		QuizQuestionModule,
	],
	providers: [QuizService],
	controllers: [QuizController],
	exports: [QuizService]
})
export class QuizModule {}
