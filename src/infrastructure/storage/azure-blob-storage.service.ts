import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    BlobServiceClient,
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters,
    BlobSASPermissions,
} from '@azure/storage-blob';
import { randomUUID } from 'crypto';

import {
    StorageService,
    UploadResult,
    StorageFolder,
} from './storage.interface';

/**
 * AzureBlobStorageService
 *
 * Concrete implementation of StorageService using Azure Blob Storage.
 *
 * Design:
 *  - Uses StorageSharedKeyCredential for full control (needed for both
 *    uploads and SAS token generation).
 *  - OnModuleInit hook verifies configuration early during app startup.
 *  - uploadFile prepends the logical folder and a UUID to prevent collisions.
 *  - getSignedUrl generates time-limited read-only access tokens without
 *    making a network call to Azure (calculated locally via the shared key).
 */
@Injectable()
export class AzureBlobStorageService implements StorageService, OnModuleInit {
    private readonly logger = new Logger(AzureBlobStorageService.name);

    private readonly connectionString: string;
    private readonly containerName: string;
    private readonly sasExpiryHours: number;

    private blobServiceClient!: BlobServiceClient;
    private sharedKeyCredential!: StorageSharedKeyCredential;

    constructor(private readonly config: ConfigService) {
        this.connectionString = this.config.get<string>('storage.azure.connectionString') ?? '';
        this.containerName = this.config.get<string>('storage.azure.container') ?? '';
        this.sasExpiryHours = this.config.get<number>('storage.azure.sasExpiryHours') ?? 24;
    }

    /**
     * Initialize the Azure SDK clients.
     * Runs right after dependency injection resolves.
     */
    onModuleInit(): void {
        if (!this.connectionString || !this.containerName) {
            this.logger.warn(
                'Azure Storage connection string missing in environment variables. Storage operations will fail.',
            );
            return;
        }

        try {
            // Initialize the primary client using the connection string
            this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);

            // To generate SAS tokens offline, we still need the SharedKeyCredential.
            // We can parse the account name and key from the connection string.
            const accountNameMatch = this.connectionString.match(/AccountName=([^;]+)/);
            const accountKeyMatch = this.connectionString.match(/AccountKey=([^;]+)/);

            if (accountNameMatch && accountKeyMatch) {
                this.sharedKeyCredential = new StorageSharedKeyCredential(
                    accountNameMatch[1],
                    accountKeyMatch[1],
                );
            } else {
                this.logger.warn(
                    'Could not parse AccountName or AccountKey from AZURE_BLOB_CONNECTION_STRING. getSignedUrl() will fail.',
                );
            }

            this.logger.log('Initialized BlobServiceClient via Connection String');
        } catch (error) {
            this.logger.error('Failed to initialize Azure Blob Storage client:', error);
            throw error;
        }
    }

    /**
     * Asserts the client is ready before performing operations.
     */
    private ensureReady(): void {
        if (!this.blobServiceClient) {
            throw new Error('AzureBlobStorageService is not properly configured.');
        }
    }

    async uploadFile(
        buffer: Buffer,
        originalName: string,
        mimeType: string,
        folder: StorageFolder,
    ): Promise<UploadResult> {
        this.ensureReady();

        // Sanitize originality: replace spaces with dashes, lowercase
        const cleanName = originalName.replace(/\s+/g, '-').toLowerCase();

        // Key format: folder/uuid-filename.ext
        const fileKey = `${folder}/${randomUUID()}-${cleanName}`;

        try {
            const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(fileKey);

            await blockBlobClient.uploadData(buffer, {
                blobHTTPHeaders: { blobContentType: mimeType },
            });

            this.logger.debug(`File uploaded successfully: ${fileKey}`);

            return {
                fileKey,
                publicUrl: blockBlobClient.url, // Useful if the container ever becomes public read
            };
        } catch (error) {
            this.logger.error(`Failed to upload file to Azure: ${fileKey}`, error);
            throw error;
        }
    }

    async getSignedUrl(fileKey: string, expiresInSeconds?: number): Promise<string> {
        this.ensureReady();

        try {
            const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(fileKey);

            const startsOn = new Date();
            // Allow minor clock skew (5 minutes in the past)
            startsOn.setMinutes(startsOn.getMinutes() - 5);

            const expiresOn = new Date();
            expiresOn.setHours(
                expiresOn.getHours() + (expiresInSeconds ? expiresInSeconds / 3600 : this.sasExpiryHours),
            );

            if (!this.sharedKeyCredential) {
                throw new Error('StorageSharedKeyCredential is not available (invalid connection string format).');
            }

            // Generate a SAS token string with read permissions
            const sasToken = generateBlobSASQueryParameters(
                {
                    containerName: this.containerName,
                    blobName: fileKey,
                    permissions: BlobSASPermissions.parse('r'),
                    startsOn,
                    expiresOn,
                },
                this.sharedKeyCredential,
            ).toString();

            // Append token to the base URL
            return `${blockBlobClient.url}?${sasToken}`;
        } catch (error) {
            this.logger.error(`Failed to generate SAS URL for file: ${fileKey}`, error);
            throw error;
        }
    }

    async deleteFile(fileKey: string): Promise<void> {
        this.ensureReady();

        try {
            const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(fileKey);

            // We use deleteIfExists so we don't throw an error if the file was already deleted
            const response = await blockBlobClient.deleteIfExists();

            if (response.succeeded) {
                this.logger.debug(`File deleted successfully: ${fileKey}`);
            } else {
                this.logger.debug(`File not found for deletion (ignoring): ${fileKey}`);
            }
        } catch (error) {
            this.logger.error(`Failed to delete file: ${fileKey}`, error);
            throw error;
        }
    }
}
