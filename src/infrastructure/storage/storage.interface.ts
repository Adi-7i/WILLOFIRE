export interface UploadResult {
    /** The unique Azure blob name (path inside container). */
    fileKey: string;
    /** Direct HTTPS URL (could be public or require SAS depending on container). */
    publicUrl: string;
}

export type StorageFolder = 'pdf' | 'answers' | 'generated';

/**
 * StorageService
 *
 * Provider-agnostic abstraction for file storage.
 * Feature modules inject this interface via STORAGE_TOKEN, never the concrete class.
 */
export interface StorageService {
    /**
     * Upload a file buffer to storage.
     *
     * @param buffer The raw file bytes
     * @param originalName The original filename (used to derive the unique storage key)
     * @param mimeType e.g., 'application/pdf', 'image/jpeg'
     * @param folder The logical prefix (e.g., 'pdf', 'answers')
     * @returns The generated unique fileKey and its public URL
     */
    uploadFile(
        buffer: Buffer,
        originalName: string,
        mimeType: string,
        folder: StorageFolder,
    ): Promise<UploadResult>;

    /**
     * Generate a time-limited, read-only URL for private files.
     *
     * @param fileKey The exact blob name returned from uploadFile
     * @param expiresInSeconds Optional override for SAS expiry
     * @returns Signed HTTPS URL
     */
    getSignedUrl(fileKey: string, expiresInSeconds?: number): Promise<string>;

    /**
     * Delete a file permanently.
     * Note: Should not throw if the file doesn't exist.
     */
    deleteFile(fileKey: string): Promise<void>;
}

export const STORAGE_TOKEN = 'STORAGE_SERVICE';
