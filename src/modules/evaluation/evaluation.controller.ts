import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EvaluationService } from './evaluation.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * EvaluationController — THIN controller
 * Delegates all evaluation logic to EvaluationService.
 */
@Controller('evaluation')
export class EvaluationController {
    constructor(private readonly evaluationService: EvaluationService) { }

    /**
     * POST /api/v1/evaluation/submit
     * Submit user answers and receive queued job ID.
     */
    @Post('submit')
    @UseInterceptors(FileInterceptor('file'))
    async submit(
        @Body() body: SubmitAnswerDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
                ],
                fileIsRequired: false, // Could be just text later, but for Phase 9 we focus on OCR files
            }),
        )
        file: Express.Multer.File,
        @CurrentUser() user: any,
    ) {
        if (!file && !body.questionRef) {
            throw new BadRequestException('Must provide either a file or a valid question reference');
        }

        return this.evaluationService.submit(body, file, user.userId);
    }

    /**
     * GET /api/v1/evaluation/results/:submissionId
     * Get the newest evaluated rubric for a given submission.
     */
    @Get('results/:submissionId')
    async getResult(@Param('submissionId') submissionId: string): Promise<unknown> {
        return this.evaluationService.getResult(submissionId);
    }

    /**
     * GET /api/v1/evaluation/history
     * Get the authenticated user's full attempt history.
     * TODO (Phase 2): Requires JwtAuthGuard + CurrentUser decorator
     */
    @Get('history')
    async getHistory(): Promise<unknown> {
        return this.evaluationService.getHistory();
    }
}
