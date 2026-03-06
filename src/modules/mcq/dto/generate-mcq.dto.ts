import { IsMongoId, IsIn, IsInt, Min, Max } from 'class-validator';

export class GenerateMcqDto {
    @IsMongoId()
    pdfId!: string;

    @IsIn(['easy', 'medium', 'hard'])
    difficulty!: 'easy' | 'medium' | 'hard';

    @IsInt()
    @Min(1)
    @Max(20)
    count!: number;
}
