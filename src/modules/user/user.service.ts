import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "src/dto/create-user.dto";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { TokenService } from "../token/token.service";
import { throwHttpException } from "src/utils/throwHttpException";
import { RESPONSE_TYPES } from "src/models/responseTypes";
import * as bcrypt from "bcrypt";
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime";
import { avatarsPath } from "src/constants/core.constants";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private tokenService: TokenService
	) {}

	// Create user
	async createUser(
		createUserDto: CreateUserDto
	): Promise<{ user: Omit<User, "password">; accessToken: string; refreshToken: string }> {
		try {
			const { username, email, password } = createUserDto;
			// Check if a user already exists with the given email
			const existingUser = await this.userRepository.findOne({ where: { email } });
			if (existingUser) {
				throwHttpException(RESPONSE_TYPES.CONFLICT, "A user with this email already exists");
			}
			// Hash password
			const hashedPassword = await bcrypt.hash(password, 10);
			// Create user
			const user = this.userRepository.create({ username, email, password: hashedPassword });
			// Save user to the database
			await this.userRepository.save(user);
			// Exclude password from user object
			const { password: _, ...userWithoutPassword } = user; // Exclude password
			return {
				user: userWithoutPassword,
				accessToken: this.tokenService.generateAccessToken(userWithoutPassword),
				refreshToken: this.tokenService.generateRefreshToken(userWithoutPassword)
			};
		} catch (error) {
			// If custom error was triggered throw it
			if (error.response) {
				throw error;
			}
			throw new InternalServerErrorException("Failed to create user");
		}
	}

	// Get a certain user
	async findUser(email: string): Promise<User> {
		const user = await this.userRepository.findOne({ where: { email }, relations: ["quizzes", "sets"] });
		if (!user) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, `User with email ${email} not found.`);
		}
		return user;
	}

	// Get all users
	async findAll(): Promise<User[]> {
		try {
			return await this.userRepository.find();
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to find users");
		}
	}

	// Delete certain user
	async deleteOne(email: string): Promise<void> {
		const user = await this.userRepository.findOne({ where: { email } });
		if (!user) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, `User with email ${email} not found.`);
		}

		try {
			await this.userRepository.delete({ email });
		} catch (error) {
			throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to delete user");
		}
	}

	async updateUserAvatar(userId: string, file: Express.Multer.File) {
		const filePath = `${avatarsPath}/${file.filename}`;
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, `User with ID ${userId} not found`);
		}

		user.avatarUrl = filePath;
		await this.userRepository.save(user); // Save the updated user to the database

		return {
			statusCode: RESPONSE_TYPES.OK,
			message: "User avatar successfully updated"
		};
	}

	async getUserAvatar(userId: string): Promise<{ file: string | null; mimetype: string | null }> {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) throwHttpException(RESPONSE_TYPES.NOT_FOUND, `Failed to find user `);
		if (!user.avatarUrl) throwHttpException(RESPONSE_TYPES.NOT_FOUND, "Failed to find user avatar");

		const filePath = path.resolve(user.avatarUrl);
		// check if the avatar file exists on the server
		if (!fs.existsSync(filePath) || !filePath) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, "Failed to find user avatar");
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
