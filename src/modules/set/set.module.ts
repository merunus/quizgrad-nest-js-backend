import { Module } from "@nestjs/common";
import { SetService } from "./set.service";
import { SetController } from "./set.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Set } from "src/entities/set.entity";
import { User } from "src/entities/user.entity";
import { Word } from "src/entities/word.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Set, User, Word])],
	providers: [SetService],
	controllers: [SetController],
	exports: [SetService]
})
export class SetModule {}
