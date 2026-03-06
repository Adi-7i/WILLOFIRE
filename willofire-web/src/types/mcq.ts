export interface McqOption {
    id: string;
    text: string;
}

export interface McqQuestion {
    id: string;
    question: string;
    options: McqOption[];
    correctOptionId: string;
    explanation: string;
}
