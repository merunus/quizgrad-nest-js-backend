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
				throw new ConflictException("A user with this email already exists");
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
			throw new InternalServerErrorException("Failed to create user");
		}
	}

	// Get a certain user
	async findOne(email: string): Promise<User> {
		try {
			const user = await this.userRepository.findOne({ where: { email } });
			if (!user) {
				throw new NotFoundException(`User with email ${email} not found.`);
			}
			return user;
		} catch (error) {
			throw new InternalServerErrorException("Failed to find a user");
		}
	}

	// Get all users
	async findAll(): Promise<User[]> {
		try {
			return await this.userRepository.find();
		} catch (error) {
			throw new InternalServerErrorException("Failed to find users");
		}
	}

	// Delete certain user
	async deleteOne(email: string): Promise<void> {
		const user = await this.userRepository.findOne({ where: { email } });
		if (!user) {
			throw new NotFoundException(`User with email ${email} not found.`);
		}

		await this.userRepository.delete({ email });
	}
}
