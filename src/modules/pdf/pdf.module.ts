import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { Pdf, PdfSchema } from './schemas/pdf.schema';
import { PdfChunk, PdfChunkSchema } from './schemas/pdf-chunk.schema';
import { PdfRepository } from './repositories/pdf.repository';
import { PdfChunkRepository } from './repositories/pdf-chunk.repository';

/**
 * PdfModule — Phase 3 update.
 *
 * Registers Pdf + PdfChunk schemas (scoped to this module only).
 * Provides and exports both repositories so Phase 4's processing
 * service can use them without reaching into the module internals.
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Pdf.name, schema: PdfSchema },
            { name: PdfChunk.name, schema: PdfChunkSchema },
        ]),
        // TODO (Phase 4): BullModule.registerQueue({ name: 'pdf-processing' })
        // TODO (Phase 4): StorageModule
    ],
    controllers: [PdfController],
    providers: [
        PdfService,
        PdfRepository,
        PdfChunkRepository,
    ],
    exports: [
        PdfService,
        PdfRepository,
        PdfChunkRepository,
    ],
})
export class PdfModule { }
