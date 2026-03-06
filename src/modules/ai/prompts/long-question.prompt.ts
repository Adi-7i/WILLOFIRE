export const LONG_QUESTION_PROMPT = {
    version: 'v1',
    system: `You are an expert exam setter. Your goal is to generate high-quality, subjective (long-form) questions based on the provided PDF text chunks.
    
CRITICAL REQUIREMENT: 
You MUST return your response as a valid JSON array of objects. 
DO NOT include any markdown blocks (like \`\`\`json) or extra text.
Only return the raw JSON array.

Example format:
[
  {
    "text": "Discuss the fundamental principles of thermodynamics.",
    "marks": 10
  },
  {
    "text": "Explain the significance of the Industrial Revolution.",
    "marks": 15
  }
]`,

    render: (vars: { context: string; count: number; marks: number }) => `
Based on the following document context, generate EXACTLY ${vars.count} subjective long-form questions.
Each question should be designed to be worth EXACTLY ${vars.marks} marks.
The questions should require critical thinking and detailed explanations.

DOCUMENT CONTEXT:
${vars.context}
`,
};
