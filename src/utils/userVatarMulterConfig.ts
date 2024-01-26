import * as path from "path";
import { diskStorage, Options as MulterConfig, FileFilterCallback } from "multer";
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";

@Catch()
export class MulterExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();

		if (exception instanceof Error && exception.message === "Only images are allowed") {
			response.status(400).json({
				statusCode: 400,
				message: exception.message
			});
		}
	}
}

export const multerConfig = {
	storage: diskStorage({
		destination: "./avatars",
		filename: (req, file, callback) => {
			const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
			const fileExt = path.extname(file.originalname); // Extracts file extension
			callback(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
		}
	}),
	fileFilter: (req, file, callback: FileFilterCallback) => {
		if (!file.originalname.match(/\.(jpg|jpeg|png|svg|gif)$/)) {
			return callback(new Error("Only images are allowed"));
		}
		callback(null, true);
	},
	limits: { fileSize: 5 * 1024 * 1024 } // 5mb is limit
} as MulterConfig;
