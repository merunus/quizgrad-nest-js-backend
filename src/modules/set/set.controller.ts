import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Req,
	UploadedFiles,
	UseGuards,
	UseInterceptors
} from "@nestjs/common";
import { SetService } from "./set.service";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { multerWordsImagesUploadConfig } from "src/utils/multer/multerWordsImagesUploadConfig";

@Controller("set")
export class SetController {
	constructor(private setService: SetService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getAllSets() {
		return this.setService.handleAllSets();
	}

	@Get("/user")
	@UseGuards(JwtAuthGuard)
	async getUserSets(@Req() req) {
		const userId = req.user.userId;
		return this.setService.handleUserSets(userId);
	}

	@Post()
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileFieldsInterceptor([{ name: "wordsImages" }], multerWordsImagesUploadConfig))
	async createUserSet(
		@UploadedFiles() files: { wordsImages?: Express.Multer.File[] },
		@Body("createSetDto") createSetDtoString: string,
		@Req() req
	) {
		const userId = req.user.userId;
		return this.setService.handleCreateUserSet(userId, createSetDtoString, files);
	}

	@Put()
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileFieldsInterceptor([{ name: "wordsImages" }], multerWordsImagesUploadConfig))
	async updateUserSet(
		@UploadedFiles() files: { wordsImages?: Express.Multer.File[] },
		@Body("updateSetDto") updateSetDtoString: string
	) {
		return this.setService.handleUpdateUserSet(updateSetDtoString, files);
	}

	@Delete("/delete-all")
	@UseGuards(JwtAuthGuard)
	async deleteAllSets() {
		await this.setService.handleDeleteAllSets();
		return { message: "All sets have been successfully deleted." };
	}

	// Static routes should be defined before the dynamic ones
	@Delete(":id")
	@UseGuards(JwtAuthGuard)
	async deleteSet(@Param("id") setId: string) {
		await this.setService.handleDeleteSet(setId);
		return { message: `Set with id ${setId} successfully deleted.` };
	}
}
