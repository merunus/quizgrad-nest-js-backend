import { Module, forwardRef } from "@nestjs/common";
import { SetService } from "./set.service";
import { SetController } from "./set.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Set } from "src/entities/set.entity";
import { User } from "src/entities/user.entity";
import { Word } from "src/entities/word.entity";
import { WordModule } from "../word/word.module";
import { QuizModule } from "../quiz/quiz.module";

@Module({
	imports: [TypeOrmModule.forFeature([Set, User, Word]), WordModule, forwardRef(() => QuizModule)],
	providers: [SetService],
	controllers: [SetController],
	exports: [SetService, TypeOrmModule.forFeature([Set])]
})
export class SetModule {}
