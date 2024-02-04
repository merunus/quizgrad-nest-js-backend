import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateSetDto } from "src/dto/create-set-dto";
import { UpdateSetDto } from "src/dto/update-set-dto";
import { Set } from "src/entities/set.entity";
import { User } from "src/entities/user.entity";
import { Word } from "src/entities/word.entity";
import { RESPONSE_TYPES } from "src/models/responseTypes";
import { throwHttpException } from "src/utils/throwHttpException";
import { Repository } from "typeorm";

@Injectable()
export class SetService {
	constructor(
		@InjectRepository(Set)
		private setRepository: Repository<Set>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(Word)
		private wordRepository: Repository<Word>
	) {}

	// Method to handle saving of the words to the database to generate their UUID
	private async saveSetWords(wordsFromDto: Word[]) {
		try {
			const newWords = await Promise.all(
				wordsFromDto.map(async (wordDto) => {
					const newWord = this.wordRepository.create({
						word: wordDto.word,
						translate: wordDto.translate
					});
					return this.wordRepository.save(newWord);
				})
			);
			return newWords;
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to save set words");
		}
	}

	// Method to handle update of words and saving them to database without changing their UUID
	private async updateSetWords(setWords: Word[], wordsFromDto: Word[]) {
		try {
			// Handle existing words update
			const updates = wordsFromDto
				.filter((wordDto) => wordDto.id)
				.map(async (wordDto) => {
					const word = setWords.find((w) => w.id === wordDto.id);
					if (word) {
						word.word = wordDto.word;
						word.translate = wordDto.translate;
						return this.wordRepository.save(word);
					}
				});

			// Handle new words creation
			const creations = wordsFromDto
				.filter((wordDto) => !wordDto.id)
				.map(async (wordDto) => {
					const newWord = this.wordRepository.create({
						word: wordDto.word,
						translate: wordDto.translate
					});
					return this.wordRepository.save(newWord);
				});

			return Promise.all([...updates, ...creations]);
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to update set words");
		}
	}

	async handleAllSets() {
		const allSets = await this.setRepository.find({ relations: ["words", "user"] });
		if (!allSets.length) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, "Could not find any sets");
		}
		return allSets;
	}

	async handleUserSets(userId: string) {
		const userSets = await this.setRepository.find({
			where: { user: { id: userId } },
			relations: ["words", "user"] // Option is used to ensure that the query includes data from the User entity related to each set
		});
		if (!userSets?.length) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, "Could not find any sets");
		}
		return userSets;
	}

	async handleCreateUserSet(userId: string, createSetDto: CreateSetDto) {
		const setCreator = await this.userRepository.findOne({ where: { id: userId } });
		if (!setCreator) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, `User with id ${userId} not found`);
		}
		try {
			// Create new words instances and save them
			const words = await this.saveSetWords(createSetDto.words as Word[]);
			// Create a new set instance
			const newSet = this.setRepository.create({
				name: createSetDto.name,
				language: createSetDto.language,
				words,
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

	async handleUpdateUserSet(updateSetDto: UpdateSetDto) {
		const set = await this.setRepository.findOne({
			where: { id: updateSetDto.setId },
			relations: ["words"]
		});
		if (!set) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, `Set with id ${updateSetDto.setId} not found.`);
		}
		try {
			// Update words
			const updatedWords = await this.updateSetWords(set.words, updateSetDto.words as Word[]);
			// Update set properties
			set.name = updateSetDto.name;
			set.language = updateSetDto.language;
			set.words = updatedWords;
			// Save set
			await this.setRepository.save(set);
			return set;
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to update set");
		}
	}

	async handleDeleteSet(setId: string) {
		const set = await this.setRepository.findOne({ where: { id: setId } });
		if (!set) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, `Set with id ${setId} not found.`);
		}

		try {
			await this.setRepository.delete({ id: setId });
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to delete set");
		}
	}

	async handleDeleteAllSets() {
		try {
			await this.setRepository.delete({});
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to delete all sets");
		}
	}
}
