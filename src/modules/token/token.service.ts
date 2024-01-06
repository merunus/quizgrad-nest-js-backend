import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";
import { AuthenticatedUser } from "../user/types";

@Injectable()
export class TokenService {
	constructor(private jwtService: JwtService) {}

	private handleRefreshTokenError(error: Error) {
		if (error instanceof TokenExpiredError) {
			throw new UnauthorizedException("Refresh token expired");
		} else if (error instanceof JsonWebTokenError) {
			throw new UnauthorizedException("Invalid refresh token");
		}
		throw new InternalServerErrorException("Failed to verify refresh token");
	}

	generateAccessToken(user: AuthenticatedUser) {
		const payload = { username: user.username, sub: user.id };
		return this.jwtService.sign(payload);
	}

	generateRefreshToken(user: AuthenticatedUser) {
		const payload = { username: user.username, sub: user.id };
		return this.jwtService.sign(payload, {
			secret: process.env.JWT_REFRESH_SECRET,
			expiresIn: process.env.REFRESH_TOKEN_EXPIRE
		});
	}

	verifyRefreshToken(token: string) {
		try {
			return this.jwtService.verify(token, {
				secret: process.env.JWT_REFRESH_SECRET
			});
		} catch (error) {
			this.handleRefreshTokenError(error);
		}
	}

	async refreshToken(refreshToken: string) {
		const payload = this.verifyRefreshToken(refreshToken);
		return {
			accessToken: this.generateAccessToken(payload)
		};
	}
}
