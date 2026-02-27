import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { STORAGE_TOKEN } from './storage.interface';
import { AzureBlobStorageService } from './azure-blob-storage.service';

/**
 * StorageModule
 *
 * @Global() decorator means this module only needs to be imported ONCE (in AppModule).
 * After that, any module can inject `@Inject(STORAGE_TOKEN)` without importing
 * StorageModule again. This makes cross-cutting utilities much easier to use.
 *
 * The concrete implementation provided here could be swapped to a LocalStorageService
 * or S3StorageService by changing the `useClass` configuration.
 */
@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: STORAGE_TOKEN,
            useClass: AzureBlobStorageService,
        },
    ],
    exports: [STORAGE_TOKEN],
})
export class StorageModule { }
