import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { QuizService } from "./quiz.service";
import { QuizSubmitDto } from "src/dto/quiz-submit-do";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";

@Controller("quiz")
export class QuizController {
	constructor(private quizService: QuizService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getAllQuizzes() {
		return this.quizService.handleGetAllQuizzes();
	}

	@Get(":setId")
	@UseGuards(JwtAuthGuard)
	async generateQuizForSet(@Param("setId") setId: string) {
		return this.quizService.handleGenerateQuizForSet(setId);
	}

	@Post("submit")
	@UseGuards(JwtAuthGuard)
	async submitQuizResults(@Body() submitQuizDto: QuizSubmitDto) {
		return this.quizService.handleQuizSubmission(submitQuizDto);
	}

	@Delete()
	@UseGuards(JwtAuthGuard)
	async deleteAllQuizzes() {
		return this.quizService.handleDeleteAllQuizzes();
	}
}
