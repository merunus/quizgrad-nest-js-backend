import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../user/user.module";
import { TokenModule } from "../token/token.module";

@Module({
	imports: [
		UserModule,
		PassportModule,
		TokenModule
	],
	providers: [AuthService],
	controllers: [AuthController],
	exports: [AuthService]
})
export class AuthModule {}
