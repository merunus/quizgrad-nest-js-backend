import { IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateWordDto {
    @IsUUID()
    @IsOptional()
    id?: string; // To uniquely identify the word for updates

    @IsString()
    word: string;

    @IsString()
    translate: string;
}