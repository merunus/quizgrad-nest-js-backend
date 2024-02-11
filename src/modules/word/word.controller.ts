import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Put,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors
} from "@nestjs/common";
import { WordService } from "./word.service";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import {  FileInterceptor } from "@nestjs/platform-express";
import { multerWordsImagesUploadConfig } from "src/utils/multer/multerWordsImagesUploadConfig";

@Controller("word")
export class WordController {
	constructor(private readonly wordService: WordService) {}

	@Delete(":wordId")
	@UseGuards(JwtAuthGuard)
	async deleteWord(@Param("wordId") wordId: string) {
		return this.wordService.handleDeleteWord(wordId);
	}

	@Put()
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor("wordImage", multerWordsImagesUploadConfig)) 
	async updateWord(
		@Body("updateWordDto") updateWordDtoString: string,
		@UploadedFile() file?: Express.Multer.File,
	) {
		return await this.wordService.handleUpdateWord(updateWordDtoString, file);
	}

	@Get("/image/:wordId")
	@UseGuards(JwtAuthGuard)
	async getWordImage(@Param("wordId") wordId: string, @Res() response) {
		const { file, mimetype } = await this.wordService.handleGetWordImage(wordId);
		response.setHeader("Content-Type", mimetype);
		response.sendFile(file);
	}
}
