import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UpdateWordDto } from "src/dto/update-word-dto";
import { Word } from "src/entities/word.entity";
import { RESPONSE_TYPES } from "src/models/responseTypes";
import { throwHttpException } from "src/utils/throwHttpException";
import { Repository } from "typeorm";
import * as path from "path";
import * as mime from "mime";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { deleteImageFromFiles } from "src/utils/deleteImageFromFiles";
import { wordsPath } from "src/constants/core.constants";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { formatValidationErrors } from "src/utils/formatValidationErrors";
dotenv.config();

@Injectable()
export class WordService {
	constructor(
		@InjectRepository(Word)
		private wordRepository: Repository<Word>
	) {}

	public async deleteWordsImagesFromFiles(words: Word[]): Promise<void> {
		await Promise.all(
			words.map(async (word) => {
				if (word.imageUrl) {
					await deleteImageFromFiles(word.imageUrl);
				}
			})
		);
	}

	async handleDeleteWord(wordId: string) {
		const word = await this.wordRepository.findOne({ where: { id: wordId } });
		if (!word) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, `Could not find word with id ${wordId}`);
		}
		try {
			await this.deleteWordsImagesFromFiles([word]);
			await this.wordRepository.delete({ id: wordId });
			return { message: "Word was successfully deleted" };
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to delete word");
		}
	}

	async handleUpdateWord(updateWordDtoString: string, file: Express.Multer.File) {
		// Transform stringified update word dto
		const updateWordDto = plainToInstance(UpdateWordDto, JSON.parse(updateWordDtoString));
		// Check for errors parsed gto
		const updateWordDtoErrors = await validate(updateWordDto);
		if (updateWordDtoErrors.length) {
			const formattedErrors = formatValidationErrors(updateWordDtoErrors);
			throwHttpException(RESPONSE_TYPES.BAD_REQUEST, formattedErrors);
		}

		if (!updateWordDto?.id) throwHttpException(RESPONSE_TYPES.BAD_REQUEST, `Word id is required`);

		const word = await this.wordRepository.findOne({ where: { id: updateWordDto?.id } });
		if (!word) {
			throwHttpException(
				RESPONSE_TYPES.NOT_FOUND,
				`Could not find word with id ${updateWordDto?.id}`
			);
		}
		try {
			// If image passed
			if (file) {
				// If word already have an image delete it
				if (word?.imageUrl || updateWordDto?.removeImage) {
					await deleteImageFromFiles(word.imageUrl);
					word.imageUrl = "";
				}
				// Assign new image to the word
				const newWordImageUrl = `${wordsPath}/${file.filename}`;
				word.imageUrl = newWordImageUrl;
			}
			word.translate = updateWordDto.translate;
			word.word = updateWordDto.word;
			await this.wordRepository.save(word);
			return word;
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to update word");
		}
	}

	async handleGetWordImage(wordId: string) {
		const word = await this.wordRepository.findOne({ where: { id: wordId } });
		if (!word)
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, `Could not find word with id ${wordId}`);
		// Word does not have an image
		if (!word.imageUrl) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, "Word does not have an image");
		}
		const filePath = path.resolve(word.imageUrl);
		// check if the avatar file exists on the server
		if (!fs.existsSync(filePath) || !filePath) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, "Failed to find word image");
		}

		const file = path.resolve(filePath);
		const mimetype = mime.lookup(file);

		if (mimetype && file) {
			return { mimetype, file };
		} else {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Could not determine file type");
		}
	}
}
