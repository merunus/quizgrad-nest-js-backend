import * as fs from "fs";

export const deleteImageFromFiles = async (imageUrl: string) => {
	if (fs.existsSync(imageUrl)) {
		try {
			await fs.promises.unlink(imageUrl);
		} catch (error) {
			console.error(`Failed to delete image at ${imageUrl}:`, error);
		}
	} else {
		console.error(`${imageUrl} does not exist on path ${imageUrl}`);
	}
};
