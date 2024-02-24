import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Exam } from "./exam.entity";

@Entity()
export class TrueFalseQuestion {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Exam, exam => exam.trueFalseQuestions)
    exam: Exam;

    @Column()
    statement: string; // The statement to be judged as true or false

    @Column()
    correctAnswer: boolean; // Whether the statement is true or false
}
