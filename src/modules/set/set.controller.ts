import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { SetService } from "./set.service";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { CreateSetDto } from "src/dto/create-set-dto";
import { UpdateSetDto } from "src/dto/update-set-dto";

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
	async createUserSet(@Req() req, @Body() createSetDto: CreateSetDto) {
		const userId = req.user.userId;
		return this.setService.handleCreateUserSet(userId, createSetDto);
	}

	@Put()
	@UseGuards(JwtAuthGuard)
	async updateUserSet(@Body() updateSetDto: UpdateSetDto) {
		return this.setService.handleUpdateUserSet(updateSetDto);
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
