import * as bcrypt from "bcrypt";
import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { AuthenticatedUser } from "../user/types";
import { TokenService } from "../token/token.service";
import { throwHttpException } from "src/utils/throwHttpException";
import { RESPONSE_TYPES } from "src/models/responseTypes";

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private tokenService: TokenService
	) {}

	async validateUser(email: string, pass: string): Promise<AuthenticatedUser | null> {
		const user = await this.userService.findOne(email);
		const isPasswordValid = user && (await bcrypt.compare(pass, user.password));

		if (!user || !isPasswordValid) {
			throwHttpException(RESPONSE_TYPES.UNAUTHORIZED, "Invalid credentials");
		}

		const { password, ...authenticatedUser } = user;
		return authenticatedUser;
	}

	async login(user: AuthenticatedUser) {
		return {
			access_token: this.tokenService.generateAccessToken(user),
			refresh_token: this.tokenService.generateRefreshToken(user)
		};
	}
}
