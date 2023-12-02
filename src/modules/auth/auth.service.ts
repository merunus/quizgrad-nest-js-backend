import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import * as bcrypt from "bcrypt";
import { AuthenticatedUser } from "../user/types";

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService
	) {}

	async validateUser(email: string, pass: string): Promise<AuthenticatedUser | null> {
		const user = await this.userService.findOne(email);
		if (user && (await bcrypt.compare(pass, user.password))) {
			const { password, ...authenticatedUser } = user;
			return authenticatedUser;
		}
		return null;
	}

	async login(user: AuthenticatedUser) {
		const payload = { username: user.username, sub: user.id };
		return {
			access_token: this.jwtService.sign(payload)
		};
	}
}
