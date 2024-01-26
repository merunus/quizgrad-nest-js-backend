import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "src/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./user.controller";
import { TokenModule } from "../token/token.module";
import { JwtStrategy } from "src/strategies/jwt.strategy";

@Module({
	imports: [TypeOrmModule.forFeature([User]), TokenModule],
	controllers: [UserController],
	providers: [UserService, JwtStrategy],
	exports: [UserService]
})
export class UserModule {}
