import { IsArray, ValidateNested, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
    @IsInt()
    @Min(0)
    questionIndex!: number;

    @IsInt()
    @Min(-1)
    @Max(3)
    selectedOption!: number;
}

export class SubmitMcqDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers!: AnswerDto[];
}
