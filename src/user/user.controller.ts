import { Body, Controller, Post, Delete, Param, Get } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "src/dto/create-user.dto";

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	async createUser(@Body() createUserDto: CreateUserDto) {
		return this.userService.createUser(createUserDto);
	}

	@Delete(":email")
	async deleteUser(@Param("email") userEmail: string) {
		await this.userService.deleteOne(userEmail);
		return { message: `User with email ${userEmail} successfully deleted.` };
	}

	@Get()
	async findAllUsers() {
		return this.userService.findAll();
	}
}
