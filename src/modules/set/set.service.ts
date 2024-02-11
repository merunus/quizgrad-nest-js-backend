import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { wordsPath } from "src/constants/core.constants";
import { CreateSetDto } from "src/dto/create-set-dto";
import { UpdateSetDto } from "src/dto/update-set-dto";
import { Set } from "src/entities/set.entity";
import { User } from "src/entities/user.entity";
import { Word } from "src/entities/word.entity";
import { RESPONSE_TYPES } from "src/models/responseTypes";
import { throwHttpException } from "src/utils/throwHttpException";
import { Repository } from "typeorm";
import { WordService } from "../word/word.service";
import { UpdateWordDto } from "src/dto/update-word-dto";
import { CreateWordDto } from "src/dto/create-word-dto";
import { deleteImageFromFiles } from "src/utils/deleteImageFromFiles";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { formatValidationErrors } from "src/utils/formatValidationErrors";

@Injectable()
export class SetService {
	constructor(
		@InjectRepository(Set)
		private setRepository: Repository<Set>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(Word)
		private wordRepository: Repository<Word>,
		// Word service
		private wordService: WordService
	) {}

	// Method to handle saving of the words to the database to generate their UUID
	private async saveSetWords(wordsFromDto: Word[], wordsFilesImages: Express.Multer.File[]) {
		try {
			const newWords = await Promise.all(
				wordsFromDto.map(async (wordDto, index) => {
					const wordIndex = index + 1;
					const imageFile = wordsFilesImages.find((file) =>
						file.originalname.includes(`|${wordIndex}`)
					);
					const newWordObject: CreateWordDto = {
						word: wordDto.word,
						translate: wordDto.translate
					};
					// if found image assign it to the word
					if (imageFile) {
						const imageUrl = `${wordsPath}/${imageFile.filename}`;
						newWordObject.imageUrl = imageUrl;
					}
					const newWord = this.wordRepository.create({ ...newWordObject });
					return this.wordRepository.save(newWord);
				})
			);
			return newWords;
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to save set words");
		}
	}

	// Method to handle update of words and saving them to database without changing their UUID
	private async updateSetWords(
		wordsFromSet: Word[],
		wordsFromDto: UpdateWordDto[],
		wordsFilesImages: Express.Multer.File[]
	): Promise<(Word | CreateWordDto)[]> {
		try {
			// Handle existing words update
			const updates = wordsFromDto
				.filter((wordDto) => wordDto.id)
				.map(async (wordDto, index) => {
					const wordIndex = index + 1;
					const wordFromSet = wordsFromSet.find((w) => w.id === wordDto.id);
					if (wordFromSet) {
						const newWordImage = wordsFilesImages.find(
							(file) => file.originalname.includes(`|${wordIndex}`) // Originalname property contains the word index
						);
						wordFromSet.word = wordDto.word;
						wordFromSet.translate = wordDto.translate;

						const shouldReplaceImage = newWordImage && wordFromSet.imageUrl;
						const shouldRemoveImage = !newWordImage && wordFromSet.imageUrl && wordDto?.removeImage;

						// If word has an old image and a new one passed delete it, or if the removeImage flag is passed
						if (shouldRemoveImage || shouldReplaceImage) {
							wordFromSet.imageUrl = "";
							await deleteImageFromFiles(wordFromSet.imageUrl);
						}
						// If new word image is provided update imageUrl
						if (newWordImage) {
							const newWordImageUrl = `${wordsPath}/${newWordImage.filename}`;
							wordFromSet.imageUrl = newWordImageUrl;
						}
						return this.wordRepository.save(wordFromSet);
					}
					return wordDto;
				});

			// Handle new words creation
			const creations = wordsFromDto
				.filter((wordDto) => !wordDto.id)
				.map(async (wordDto, index) => {
					const wordIndex = index + 1;
					const wordImage = wordsFilesImages.find((file) =>
						file.originalname.includes(`|${wordIndex}`)
					);
					const wordObject: CreateWordDto = { word: wordDto.word, translate: wordDto.translate };
					// If an image was passed for the word add it to the word object
					if (wordImage) {
						const newWordImageUrl = `${wordsPath}/${wordImage.filename}`;
						wordObject.imageUrl = newWordImageUrl;
					}
					const newWord = this.wordRepository.create({ ...wordObject });
					return this.wordRepository.save(newWord);
				});

			// Filter out undefined values after Promise.all resolves
			const results = await Promise.all([...updates, ...creations]);
			return results.filter((result) => result !== undefined);
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to update set words");
		}
	}

	async handleAllSets() {
		try {
			const allSets = await this.setRepository.find({ relations: ["words", "user"] });
			return allSets;
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to get user sets");
		}
	}

	async handleUserSets(userId: string) {
		try {
			const userSets = await this.setRepository.find({
				where: { user: { id: userId } },
				relations: ["words", "user"] // Option is used to ensure that the query includes data from the User entity related to each set
			});
			return userSets;
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to get user sets");
		}
	}

	async handleCreateUserSet(
		userId: string,
		createSetDtoString: string,
		files: {
			wordsImages?: Express.Multer.File[];
		}
	) {
		// Transform stringified set dto
		const createSetDto = plainToInstance(CreateSetDto, JSON.parse(createSetDtoString));
		// Check for errors parsed gto
		const createSetDtoErrors = await validate(createSetDto);
		if (createSetDtoErrors.length) {
			const formattedErrors = formatValidationErrors(createSetDtoErrors);
			throwHttpException(RESPONSE_TYPES.BAD_REQUEST, formattedErrors);
		}

		// Get the user id from the JWT guard by token
		const setCreator = await this.userRepository.findOne({ where: { id: userId } });
		if (!setCreator) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, `User with id ${userId} not found`);
		}
		try {
			// Create new words instances and save them
			const createdWords = await this.saveSetWords(
				createSetDto.words as Word[],
				files?.wordsImages || []
			);
			// Create a new set instance
			const newSet = this.setRepository.create({
				name: createSetDto.name,
				language: createSetDto.language,
				words: createdWords,
				user: setCreator
			});
			// Save the new set
			const savedSet = await this.setRepository.save(newSet);
			const { user, ...setWithoutUser } = savedSet;
			// Return the created set without the user
			return setWithoutUser;
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to create set");
		}
	}

	async handleUpdateUserSet(
		updateSetDtoString: string,
		files: { wordsImages?: Express.Multer.File[] }
	) {
		// Transform stringified set dto
		const updateSetDto = plainToInstance(UpdateSetDto, JSON.parse(updateSetDtoString));
		// Check for errors parsed gto
		const updateSetDtoErrors = await validate(updateSetDto);
		if (updateSetDtoErrors.length) {
			const formattedErrors = formatValidationErrors(updateSetDtoErrors);
			throw new BadRequestException(formattedErrors);
		}

		const set = await this.setRepository.findOne({
			where: { id: updateSetDto.setId },
			relations: ["words"]
		});
		if (!set) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, `Set with id ${updateSetDto.setId} not found.`);
		}
		try {
			const updatedWords = await this.updateSetWords(
				set.words,
				updateSetDto.words,
				files?.wordsImages || []
			);
			// Save the updated words
			await this.wordRepository.save(updatedWords);
			// Update the set with any new details provided
			set.name = updateSetDto.name;
			set.language = updateSetDto.language;
			// Save the updated set
			await this.setRepository.save(set);
			return set; // Or some representation of the updated set
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to update set");
		}
	}

	async handleDeleteSet(setId: string) {
		const set = await this.setRepository.findOne({ where: { id: setId }, relations: ["words"] });
		if (!set) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, `Set with id ${setId} not found.`);
		}
		try {
			// Delete file images attached to the words inside the set
			await this.wordService.deleteWordsImagesFromFiles(set.words);
			// Delete set
			await this.setRepository.delete({ id: setId });
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to delete set");
		}
	}

	async handleDeleteAllSets() {
		try {
			const sets = await this.setRepository.find({ relations: ["words"] });
			if (sets.length) {
				const setWords = sets.map((set) => set.words).flat();
				await this.wordService.deleteWordsImagesFromFiles(setWords);
				await this.setRepository.delete({});
			}
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to delete all sets");
		}
	}
}
