import * as bcrypt from "bcrypt";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { AuthenticatedUser } from "../user/types";
import { TokenService } from "../token/token.service";

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private tokenService: TokenService
	) {}

	async validateUser(email: string, pass: string): Promise<AuthenticatedUser | null> {
		const user = await this.userService.findOne(email);
		if (!user) {
			throw new NotFoundException(`User with email ${email} not found`);
		}
		if (await bcrypt.compare(pass, user.password)) {
			const { password, ...authenticatedUser } = user;
			return authenticatedUser;
		}
		return null;
	}

	async login(user: AuthenticatedUser) {
		return {
			access_token: this.tokenService.generateAccessToken(user),
			refresh_token: this.tokenService.generateRefreshToken(user)
		};
	}
}
