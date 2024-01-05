import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "src/dto/create-user.dto";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "../auth/types";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private jwtService: JwtService
	) {}

	// Create user
	async createUser(
		createUserDto: CreateUserDto
	): Promise<{ user: Omit<User, "password">; access_token: string }> {
		const { username, email, password } = createUserDto;

		// Check if a user already exists with the given email
		const existingUser = await this.userRepository.findOne({ where: { email } });
		if (existingUser) {
			throw new ConflictException("A user with this email already exists");
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = this.userRepository.create({ username, email, password: hashedPassword });

		await this.userRepository.save(user);

		const { password: _, ...userWithoutPassword } = user; // Exclude password
		const jwtPayload: JwtPayload = { username: user.username, sub: user.id };
		const token = this.jwtService.sign(jwtPayload);

		return { user: userWithoutPassword, access_token: token };
	}

	// Get a certain user
	async findOne(email: string): Promise<User | undefined> {
		return this.userRepository.findOne({ where: { email } });
	}

	// Get all users
	async findAll(): Promise<{ users: Promise<User[]>, status:string}> {
	// async findAll(): Promise<User[]> {
		// return this.userRepository.find() as Promise<User[]>;
		const users = this.userRepository.find() as Promise<User[]>;
		return { users, status: "OkiOk222i"}
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
