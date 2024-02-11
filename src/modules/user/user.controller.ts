import {
	Body,
	Controller,
	Post,
	Delete,
	Param,
	Get,
	UseInterceptors,
	UploadedFile,
	UseGuards,
	Req,
	Res
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "src/dto/create-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { throwHttpException } from "src/utils/throwHttpException";
import { RESPONSE_TYPES } from "src/models/responseTypes";
import { multerUserAvatarImageUploadConfig } from "src/utils/multer/multerUserAvatarImageUploadConfig";

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post("/create")
	async createUser(@Body() createUserDto: CreateUserDto) {
		return this.userService.createUser(createUserDto);
	}

	@Delete(":email")
	@UseGuards(JwtAuthGuard)
	async deleteUser(@Param("email") userEmail: string) {
		await this.userService.deleteOne(userEmail);
		return { message: `User with email ${userEmail} successfully deleted.` };
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	async findAllUsers() {
		return this.userService.findAll();
	}

	@Post("/avatar")
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor("avatar", multerUserAvatarImageUploadConfig)) //  intercept a file from the incoming request where the file is sent under the key 'file'
	async uploadUserAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
		if (!file) {
			throwHttpException(RESPONSE_TYPES.BAD_REQUEST, "No file uploaded");
		}
		// req.user object that is automatically populated by the JwtAuthGuard
		const userId = req.user.userId;
		return this.userService.updateUserAvatar(userId, file);
	}

	@Get("/avatar")
	@UseGuards(JwtAuthGuard)
	async getUserAvatar(@Req() request, @Res() response) {
		const userId = request.user.userId;
		const { file, mimetype } = await this.userService.getUserAvatar(userId);
		response.setHeader("Content-Type", mimetype);
		response.sendFile(file);
	}
}
