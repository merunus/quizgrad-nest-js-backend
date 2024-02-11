import * as path from "path";
import { diskStorage, Options as MulterConfig, FileFilterCallback } from "multer";
import {
	MULTER_FILE_SIZE_LIMIT,
	avatarsPath,
	validImageFileFormatsRegex
} from "src/constants/core.constants";

export const multerUserAvatarImageUploadConfig = {
	storage: diskStorage({
		destination: avatarsPath,
		filename: (req, file, callback) => {
			const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
			const fileExt = path.extname(file.originalname); // Extracts file extension
			callback(null, `avatar-${uniqueSuffix}${fileExt}`);
		}
	}),
	fileFilter: (req, file, callback: FileFilterCallback) => {
		if (!file.originalname.match(validImageFileFormatsRegex)) {
			return callback(new Error("Only images are allowed"));
		}
		callback(null, true);
	},
	limits: { fileSize: MULTER_FILE_SIZE_LIMIT } // 5mb is limit
} as MulterConfig;
