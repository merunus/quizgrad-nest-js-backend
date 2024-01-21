import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";
import { AuthenticatedUser } from "../user/types";
import { throwHttpException } from "src/utils/throwHttpException";
import { RESPONSE_TYPES } from "src/models/responseTypes";

@Injectable()
export class TokenService {
	constructor(private jwtService: JwtService) {}

	private handleRefreshTokenError(error: Error) {
		if (error instanceof TokenExpiredError) {
			throwHttpException(RESPONSE_TYPES.UNAUTHORIZED, "Refresh token expired");
		} else if (error instanceof JsonWebTokenError) {
			throwHttpException(RESPONSE_TYPES.UNAUTHORIZED, "Invalid refresh token");
		}
		throwHttpException(RESPONSE_TYPES.SERVER_ERROR, "Failed to verify refresh token");
	}

	generateAccessToken(user: AuthenticatedUser) {
		const payload = { sub: user.id };
		return this.jwtService.sign(payload);
	}

	generateRefreshToken(user: AuthenticatedUser) {
		const payload = { sub: user.id };
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
