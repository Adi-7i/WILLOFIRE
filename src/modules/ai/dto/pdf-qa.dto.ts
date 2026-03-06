import { IsString, IsNotEmpty, MaxLength, IsMongoId } from 'class-validator';

export class PdfQaDto {
    @IsMongoId()
    @IsNotEmpty()
    pdfId!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    question!: string;
}
