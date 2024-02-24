import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { SetModule } from "../set/set.module";
import { WordModule } from "../word/word.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { QuizModule } from "../quiz/quiz.module";
import { QuizQuestionModule } from "../quiz-question/quiz-question.module";
import { typeOrmConfig } from "src/typeorm/typeormConfig";
import { ExamModule } from "../exam/exam.module";
import { WritingQuestionModule } from "../writing-question/writing-question.module";
import { TrueFalseQuestionModule } from "../true-false-question/true-false-question.module";
import { MatchingQuestionModule } from "../matching-question/matching-question.module";

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: "/avatars", // Directly use the absolute path
			serveRoot: "/avatars/"
		}),
		ServeStaticModule.forRoot({
			rootPath: "/wordsImages", // Directly use the absolute path
			serveRoot: "/wordsImages/"
		}),
		ConfigModule.forRoot({
			isGlobal: true
		}),
		TypeOrmModule.forRoot(typeOrmConfig),
		UserModule,
		AuthModule,
		SetModule,
		WordModule,
		QuizModule,
		QuizQuestionModule,
		ExamModule,
		WritingQuestionModule,
		TrueFalseQuestionModule,
		MatchingQuestionModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
