import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "src/dto/create-user.dto";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { TokenService } from "../token/token.service";
import { throwHttpException } from "src/utils/throwHttpException";
import { RESPONSE_TYPES } from "src/models/responseTypes";
import * as fs from "fs";
import * as path from "path";

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
	async findOne(email: string): Promise<User> {
		const user = await this.userRepository.findOne({ where: { email } });
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

	async updateUserAvatar(userId: string, filePath: string) {
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

	async getUserAvatar(userId: string): Promise<{ filePath: string | null }> {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user || !user.avatarUrl) {
			throwHttpException(RESPONSE_TYPES.NOT_FOUND, "Avatar was not found");
		}

		const filePath = path.resolve(user.avatarUrl);
		// check if the avatar file exists on the server
		if (!fs.existsSync(filePath)) {
			return { filePath: null };
		}

		return { filePath };
	}
}
