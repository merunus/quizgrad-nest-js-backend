import { Module } from "@nestjs/common";
import { WordService } from "./word.service";
import { WordController } from "./word.controller";
import { Word } from "src/entities/word.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
	imports: [TypeOrmModule.forFeature([Word])],
	providers: [WordService],
	controllers: [WordController],
	exports: [WordService]
})
export class WordModule {}
