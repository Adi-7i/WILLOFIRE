import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { McqController } from './mcq.controller';
import { McqService } from './mcq.service';
import { McqTest, McqTestSchema } from './schemas/mcq-test.schema';
import { McqAttempt, McqAttemptSchema } from './schemas/mcq-attempt.schema';
import { McqTestRepository } from './repositories/mcq-test.repository';
import { McqAttemptRepository } from './repositories/mcq-attempt.repository';
import { PdfModule } from '../pdf/pdf.module';
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module';

/**
 * McqModule — Phase 3 update.
 *
 * Registers McqTest + McqAttempt schemas.
 * Provides both repositories for use in this module and by future
 * AiModule / EvaluationModule integrations.
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: McqTest.name, schema: McqTestSchema },
            { name: McqAttempt.name, schema: McqAttemptSchema },
        ]),
        PdfModule,
        PdfGeneratorModule,
    ],
    controllers: [McqController],
    providers: [
        McqService,
        McqTestRepository,
        McqAttemptRepository,
    ],
    exports: [
        McqService,
        McqTestRepository,
        McqAttemptRepository,
    ],
})
export class McqModule { }
