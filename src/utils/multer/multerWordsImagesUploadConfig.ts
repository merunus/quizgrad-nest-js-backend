import { FileFilterCallback, diskStorage } from "multer";
import { extname } from "path";
import {
	MULTER_FILE_SIZE_LIMIT,
	validImageFileFormatsRegex,
	wordsPath
} from "src/constants/core.constants";

export const multerWordsImagesUploadConfig = {
	storage: diskStorage({
		destination: wordsPath,
		filename: (req, file, callback) => {
			const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
			// Split the file name to remove the index
			const nameParts = file.originalname.split("|");
			const nameWithoutIndex = nameParts[0];
			const fileExt = extname(nameWithoutIndex); // Ensure the extension is correct
			// Use the name without index and append a unique suffix and the extension
			const newFilename = `wordImage-${uniqueSuffix}${fileExt}`;
			callback(null, newFilename);
		}
	}),
	fileFilter: (req, file, callback: FileFilterCallback) => {
		const filename = file.originalname.split("|")[0]; // Extract word index from the filename
		if (!filename.match(validImageFileFormatsRegex)) {
			return callback(new Error("Only images are allowed"));
		}
		callback(null, true);
	},
	limits: { fileSize: MULTER_FILE_SIZE_LIMIT } // 5mb is limit
};
