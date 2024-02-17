import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Set } from "./set.entity";

@Entity()
export class Word {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	word: string;

	@Column()
	translate: string;

	@Column({ nullable: true })
	imageUrl?: string;

	// indicates that each Word is associated with one Set
	@ManyToOne(() => Set, (set) => set.words, { onDelete: "CASCADE" }) // When delete set delete all attached words
	set: Set;
}
