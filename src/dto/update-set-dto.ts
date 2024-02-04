import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from "class-validator";
import { CreateSetDto } from "./create-set-dto";
import { Type } from "class-transformer";
import { UpdateWordDto } from "./update-word-dto";

export class UpdateSetDto extends CreateSetDto {
	@IsUUID()
	setId: string; // Set ID for the set being updated

	@IsArray()
	@ArrayMinSize(2, { message: "There must be at least 2 words in a set" })
	@ValidateNested({ each: true })
	@Type(() => UpdateWordDto)
	words: UpdateWordDto[]; // Use UpdateWordDto which includes IDs
}
