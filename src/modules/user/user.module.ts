import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "src/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./user.controller";
import { TokenModule } from "../token/token.module";

@Module({
	imports: [TypeOrmModule.forFeature([User]), TokenModule],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService]
})
export class UserModule {}
