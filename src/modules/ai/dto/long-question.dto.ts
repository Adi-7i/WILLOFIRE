import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class LongQuestionDto {
    @IsString()
    @IsNotEmpty()
    pdfId!: string;

    @IsNumber()
    @Min(1)
    @Max(20)
    count!: number;

    @IsNumber()
    @Min(5)
    @Max(25)
    marks!: number;
}
