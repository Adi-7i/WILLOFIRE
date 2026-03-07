export type ProcessingStatus = 'uploaded' | 'processing' | 'ready' | 'failed';

export interface PdfListItem {
    id: string;
    originalName: string;
    fileSizeBytes: number;
    status: ProcessingStatus;
    createdAt: string;
    pageCount?: number | null;
}

export interface AskPdfPayload {
    pdfId: string;
    question: string;
}

export interface AskPdfResponse {
    answer: string;
    sources: number[];
    tokensUsed: number;
    promptVersion: string;
}

export interface McqQuestionDto {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export interface McqTestDto {
    id: string;
    pdfId: string;
    title: string;
    totalQuestions: number;
    questions: McqQuestionDto[];
    createdAt: string;
}

export interface SubmitMcqAnswerDto {
    questionIndex: number;
    selectedOption: number;
}

export interface SubmitMcqResponse {
    attemptId: string;
    totalQuestions: number;
    score: number;
    correct: number;
    incorrect: number;
    results: Array<{
        question: string;
        selectedOption: number;
        correctAnswer: number;
        explanation: string;
        isCorrect: boolean;
    }>;
}

export interface EvaluationSubmitResponse {
    submissionId: string;
    status: 'queued';
    message: string;
}

export interface EvaluationResultResponse {
    score: number;
    maxScore: number;
    strengths: string[];
    improvements: string[];
    version: number;
}

export interface EvaluationHistoryItem {
    id: string;
    questionRef: string;
    type: 'pdf' | 'image' | 'text';
    createdAt: string;
}

export type DownloadCategory = 'mock-test' | 'answer-key' | 'long-question';

export interface DownloadItem {
    id: string;
    title: string;
    category: DownloadCategory;
    createdAt: string;
    sizeLabel?: string;
    action: () => Promise<string>;
}
