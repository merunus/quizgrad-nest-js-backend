import { Controller, Post, Body, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "src/dto/login.dto";
import { CreateUserDto } from "src/dto/create-user.dto";
import { UserService } from "../user/user.service";

@Controller("auth")
export class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService
	) {}

	@Post("login")
	async login(@Body() loginDto: LoginDto) {
		const user = await this.authService.validateUser(loginDto.email, loginDto.password);
		if (!user) {
			throw new UnauthorizedException("Invalid credentials");
		}
		return this.authService.login(user);
	}

	@Post()
	async register(@Body() createUserDto: CreateUserDto) {
		return this.userService.createUser(createUserDto);
	}
}
