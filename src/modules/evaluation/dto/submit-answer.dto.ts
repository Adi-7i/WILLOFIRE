import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitAnswerDto {
    @IsString()
    @IsNotEmpty()
    questionRef!: string;
}
