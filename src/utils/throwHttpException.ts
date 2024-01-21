import {
	BadRequestException,
	NotFoundException,
	UnauthorizedException,
	ForbiddenException,
	ConflictException,
	InternalServerErrorException,
	HttpException
} from "@nestjs/common";
import { RESPONSE_TYPES } from "src/models/responseTypes";

export function throwHttpException(type: RESPONSE_TYPES, message: string) {
	switch (type) {
		case RESPONSE_TYPES.NO_CONTENT:
			throw new HttpException(message, RESPONSE_TYPES.NO_CONTENT);
		case RESPONSE_TYPES.BAD_REQUEST:
			throw new BadRequestException(message);
		case RESPONSE_TYPES.UNAUTHORIZED:
			throw new UnauthorizedException(message);
		case RESPONSE_TYPES.FORBIDDEN:
			throw new ForbiddenException(message);
		case RESPONSE_TYPES.NOT_FOUND:
			throw new NotFoundException(message);
		case RESPONSE_TYPES.CONFLICT:
			throw new ConflictException(message);
		case RESPONSE_TYPES.SERVER_ERROR:
			throw new InternalServerErrorException(message);
		default:
			throw new HttpException("Unexpected error", RESPONSE_TYPES.SERVER_ERROR);
	}
}
