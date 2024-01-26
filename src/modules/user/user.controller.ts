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
	UseFilters,
	Req,
	Res
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "src/dto/create-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { MulterExceptionFilter, multerConfig } from "src/utils/userVatarMulterConfig";
import { throwHttpException } from "src/utils/throwHttpException";
import { RESPONSE_TYPES } from "src/models/responseTypes";
import * as path from "path";
import * as mime from "mime-types";
import { avatarsPath } from "src/constants/core.constants";

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

	@Post("/avatar")
	@UseGuards(JwtAuthGuard)
	@UseFilters(new MulterExceptionFilter()) // To pass custom error through the multerConfig interceptor
	@UseInterceptors(FileInterceptor("file", multerConfig)) //  intercept a file from the incoming request where the file is sent under the key 'file'
	async uploadUserAvatar(@UploadedFile() file, @Req() req) {
		if (!file) {
			throwHttpException(RESPONSE_TYPES.BAD_REQUEST, "No file uploaded");
		}
		// req.user object that is automatically populated by the JwtAuthGuard
		const userId = req.user.userId;
		const filePath = `${avatarsPath}/${file.filename}`;
		return this.userService.updateUserAvatar(userId, filePath);
	}

	@Get("/avatar")
	@UseGuards(JwtAuthGuard)
	async getUserAvatar(@Req() request, @Res() response) {
		const userId = request.user.userId;
		const { filePath } = await this.userService.getUserAvatar(userId);

		if (!filePath) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, "Failed to find user avatar");
		}

		const file = path.resolve(filePath);
		const mimetype = mime.lookup(file);

		if (mimetype) {
			response.setHeader("Content-Type", mimetype);
			response.sendFile(file);
		} else {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Could not determine file type");
		}
	}
}
