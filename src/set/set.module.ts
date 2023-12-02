import { Module } from "@nestjs/common";
import { SetService } from "./set.service";
import { SetController } from "./set.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Set } from "src/entities/set.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Set])],
	providers: [SetService],
	controllers: [SetController],
	exports: [SetService]
})
export class SetModule {}
