import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Word {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	word: string;

	@Column()
	translate: string;
}
