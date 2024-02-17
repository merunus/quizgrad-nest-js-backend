import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuizSubmitDto } from "src/dto/quiz-submit-do";
import { QuizQuestion } from "src/entities/quiz-question.entity";
import { Quiz } from "src/entities/quiz.entity";
import { Set } from "src/entities/set.entity";
import { User } from "src/entities/user.entity";
import { Word } from "src/entities/word.entity";
import { RESPONSE_TYPES } from "src/models/responseTypes";
import { generateQuizScoreMessage } from "src/utils/generateQuizScoreMessage";
import { throwHttpException } from "src/utils/throwHttpException";
import { Repository } from "typeorm";

@Injectable()
export class QuizService {
	constructor(
		@InjectRepository(Set)
		private setRepository: Repository<Set>,
		@InjectRepository(Quiz)
		private quizRepository: Repository<Quiz>,
		@InjectRepository(QuizQuestion)
		private quizQuestionRepository: Repository<QuizQuestion>,
		@InjectRepository(User)
		private userRepository: Repository<User>
	) {}

	async handleGenerateQuizForSet(setId: string) {
		try {
			const set = await this.setRepository.findOne({
				where: { id: setId },
				relations: ["words", "user"]
			});
			// Check set
			if (!set) throwHttpException(RESPONSE_TYPES.NOT_FOUND, `Failed to find set with id ${setId}`);
			// Check set words
			if (!set?.words?.length || set.words?.length < 2)
				throwHttpException(
					RESPONSE_TYPES.BAD_REQUEST,
					"Set does not have enough words for the quiz"
				);
			if (!set?.user) throwHttpException(RESPONSE_TYPES.BAD_REQUEST, "Failed to find set user");

			// Create a new Quiz instance
			const newQuiz = this.quizRepository.create({
				set: set,
				user: set.user
			});

			// Save the Quiz instance to get a database-generated ID
			const savedQuiz = await this.quizRepository.save(newQuiz);

			// Decide either the quiz will be where 4 options are translates or words
			const quizType = Math.random() < 0.5 ? "translateWords" : "wordsTranslate";

			// Generate quiz questions
			const quizQuestions: QuizQuestion[] = set.words.map((currentWord: Word) => {
				const shuffledOptions = [
					...set.words
						.filter((w) => w.id !== currentWord.id) // Filter current word
						.sort(() => 0.5 - Math.random()) // Shuffle words
						.slice(0, 3), // Get 3 random words
					currentWord
				].map((w) => (quizType === "translateWords" ? w.word : w.translate));

				return this.quizQuestionRepository.create({
					quiz: savedQuiz,
					question: quizType === "translateWords" ? currentWord.translate : currentWord.word,
					options: shuffledOptions,
					correctAnswer: quizType === "translateWords" ? currentWord.word : currentWord.translate
				});
			});

			// Save QuizQuestion instances
			await this.quizQuestionRepository.save(quizQuestions);

			// Optionally, reload the quiz to include the questions in the response
			return this.quizRepository.findOne({ where: { id: savedQuiz.id }, relations: ["questions"] });
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to generate quiz");
		}
	}

	async handleQuizSubmission({ questionsAnswers, quizId }: QuizSubmitDto) {
		try {
			const quiz = await this.quizRepository.findOne({
				where: { id: quizId },
				relations: ["questions", "user"]
			});
			if (!quiz)
				throwHttpException(RESPONSE_TYPES.NOT_FOUND, `Failed to find quiz with id ${quizId}`);
			if (!quiz?.questions?.length)
				throwHttpException(RESPONSE_TYPES.NO_CONTENT, "Quiz does not contain any questions");

			let correctCount: number = 0;
			// Check the answers
			quiz.questions.forEach(async (question) => {
				const questionAnswer = questionsAnswers.find((answer) => answer.questionId === question.id);
				if (questionAnswer) {
					// Update the question with the user's answer
					question.userAnswer = questionAnswer.userAnswer;
					if (
						questionAnswer.userAnswer.toLowerCase().trim() ===
						question.correctAnswer.toLowerCase().trim()
					)
						correctCount++;
					await this.quizQuestionRepository.save(question);
				}
			});

			// Calculate score as a percentage
			const score = (correctCount / quiz.questions.length) * 100;
			// Optionally, format the score to a fixed number of decimal places
			const formattedScore = parseFloat(score.toFixed(2));
			// Generate message based on score
			const scoreMessage: string = generateQuizScoreMessage(formattedScore);

			const quizWithScore: Quiz = { ...quiz, score: formattedScore };
			// Assuming you have calculated the formattedScore as shown previously
			await this.quizRepository.save(quizWithScore);

			// To get the user with quizzes relation
			const updatedUser = await this.userRepository.findOne({
				where: { id: quiz.user.id },
				relations: ["quizzes"]
			});

			// Add the quiz to the user quizzes history
			if (updatedUser) {
				updatedUser.quizzes.push(quizWithScore);
				await this.userRepository.save(updatedUser);
			}

			return {
				correctCount,
				errorsCount: quiz.questions.length - correctCount,
				score: formattedScore,
				message: scoreMessage
			};
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to submit the quiz");
		}
	}

	async handleGetAllQuizzes() {
		try {
			const quizzes = await this.quizRepository.find({ relations: ["user", "set", "questions"] });
			return quizzes;
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to get all quizzes");
		}
	}
	async handleDeleteAllQuizzes() {
		try {
			await this.quizRepository.delete({});
			return { message: "Successfully deleted all quizzes" };
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to delete all quizzess");
		}
	}
}
