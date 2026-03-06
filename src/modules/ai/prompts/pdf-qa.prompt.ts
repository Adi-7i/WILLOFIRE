/**
 * pdf-qa.prompt.ts
 *
 * Encapsulates the prompt design for answering questions based on PDF context.
 * Exporting structured prompts here keeps the business logic clean and allows
 * for easy version bumping and A/B testing of prompt engineering.
 */

export const PDF_QA_PROMPT = {
    version: 'v1',

    // System instruction injected as the 'system' role
    system: `You are an intelligent study assistant named Willofire.
Your primary job is to answer the user's questions accurately using ONLY the provided text context.

RULES:
1. Do NOT hallucinate or guess. If the answer is not explicitly written in or directly inferable from the context, say: "I couldn't find the exact answer to that in the document."
2. Keep your answers concise, clear, and focused.
3. Be professional but encouraging.`,

    // Dynamic renderer injected as the 'user' role
    render: (vars: { context: string; question: string }) => `DOCUMENT CONTEXT:
---------------------
${vars.context}
---------------------

USER QUESTION:
${vars.question}

Please answer the question based strictly on the context above.`
};
