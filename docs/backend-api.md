# WILLOFIRE Backend API Documentation

## Overview
- Framework: NestJS
- Base URL: `http://localhost:3000/api/v1`
- Auth: JWT Bearer token (global guard enabled)
- Content types: `application/json`, `multipart/form-data`

## API Conventions
- Global prefix: `/api`
- URI versioning: `/v1`
- Most endpoints are protected by default
- Public endpoints:
  - `GET /health`
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`

## Authentication
Use access token in header:

```http
Authorization: Bearer <accessToken>
```

Auth token response shape:

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

## Global Error Response Shape
All handled errors follow:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "path": "/api/v1/...",
  "timestamp": "2026-03-26T17:20:00.000Z"
}
```

---

## Health

### GET /health (Public)
Checks MongoDB + Redis status.

Response example:

```json
{
  "status": "ok",
  "db": "connected",
  "redis": "connected"
}
```

---

## Auth

### POST /auth/register (Public)
Create user account.

Request body:

```json
{
  "email": "user@example.com",
  "password": "StrongPass@123"
}
```

Validation:
- `email`: valid email
- `password`: 8-64 chars, at least one uppercase, one number, one special char

Response: token pair (`accessToken`, `refreshToken`)

### POST /auth/login (Public)
Authenticate user.

Request body:

```json
{
  "email": "user@example.com",
  "password": "StrongPass@123"
}
```

Response: token pair

### POST /auth/refresh (Public)
Rotate access and refresh tokens.

Request body:

```json
{
  "refreshToken": "<jwt-refresh-token>"
}
```

Response: token pair

### POST /auth/logout (Protected)
Invalidate active refresh token hash for current user.

Response:

```json
{
  "message": "Logged out successfully."
}
```

---

## PDF

### POST /pdf/upload (Protected, multipart/form-data)
Upload a PDF and enqueue background processing.

Form-data:
- `file` (required): PDF file

Validation:
- file type: `application/pdf`
- max size: 50 MB

Response:

```json
{
  "pdfId": "69c55830595f42934bdc5927",
  "status": "uploaded"
}
```

### GET /pdf (Protected)
List user PDFs.

Response: array of PDF documents.

### GET /pdf/:id (Protected)
Get a PDF by id.

Path params:
- `id`: PDF id

Response: PDF document.

---

## MCQ

### POST /mcq/generate (Protected)
Queue MCQ generation from a PDF.

Request body:

```json
{
  "pdfId": "69c55830595f42934bdc5927",
  "difficulty": "medium",
  "count": 10
}
```

Validation:
- `pdfId`: Mongo id
- `difficulty`: `easy | medium | hard`
- `count`: integer 1-20

Response:

```json
{
  "status": "queued",
  "message": "MCQ generation has been queued."
}
```

### GET /mcq (Protected)
List MCQ tests for user.

Response: array of MCQ test documents.

### GET /mcq/:id (Protected)
Get one MCQ test.

Path params:
- `id`: test id

Response: MCQ test document.

### POST /mcq/:testId/submit (Protected)
Submit answers and receive score breakdown.

Request body:

```json
{
  "answers": [
    { "questionIndex": 0, "selectedOption": 1 },
    { "questionIndex": 1, "selectedOption": -1 },
    { "questionIndex": 2, "selectedOption": 3 }
  ]
}
```

Validation:
- `questionIndex`: integer, min 0
- `selectedOption`: integer from -1 to 3 (`-1` = skipped)

Response example:

```json
{
  "attemptId": "69c55aaa595f42934bdc5fff",
  "totalQuestions": 10,
  "score": 70,
  "correct": 7,
  "incorrect": 2,
  "results": []
}
```

### GET /mcq/:testId/download (Protected)
Generate/upload test PDF and return download URL.

Response:

```json
{
  "downloadUrl": "https://..."
}
```

### GET /mcq/:testId/download-answer-key (Protected)
Generate/upload answer-key PDF and return download URL.

Response:

```json
{
  "downloadUrl": "https://..."
}
```

---

## Evaluation

### POST /evaluation/submit (Protected, multipart/form-data)
Submit answer for evaluation; processing is async.

Form-data:
- `questionRef` (required): string
- `file` (optional): image/pdf

Validation:
- allowed file types: `png`, `jpeg`, `jpg`, `pdf`
- max size: 10 MB

Response:

```json
{
  "submissionId": "69c55bbb595f42934bdc6001",
  "status": "queued",
  "message": "Answer submission received and queued for AI evaluation."
}
```

### GET /evaluation/results/:submissionId (Protected)
Get latest evaluation result for submission.

Path params:
- `submissionId`: evaluation submission id

Response example:

```json
{
  "score": 6,
  "maxScore": 10,
  "strengths": ["..."],
  "improvements": ["..."],
  "version": 2
}
```

### GET /evaluation/history (Protected)
Currently placeholder endpoint.

Response:

```json
{
  "message": "Evaluation history — coming in Phase 2"
}
```

---

## AI

### POST /ai/pdf-qa (Protected)
Ask a question based on one uploaded PDF.

Request body:

```json
{
  "pdfId": "69c55830595f42934bdc5927",
  "question": "Explain the key strategic fronts in this conflict."
}
```

Validation:
- `pdfId`: Mongo id
- `question`: non-empty string, max 500 chars

Response example:

```json
{
  "answer": "...",
  "sources": [1, 2],
  "promptVersion": "v1",
  "tokensUsed": 1450
}
```

### POST /ai/long-question/download (Protected)
Generate subjective questions and return downloadable PDF URL.

Request body:

```json
{
  "pdfId": "69c55830595f42934bdc5927",
  "count": 10,
  "marks": 10
}
```

Validation:
- `count`: 1-20
- `marks`: 5-25

Response:

```json
{
  "downloadUrl": "https://..."
}
```

---

## Quick Start cURL

### Register

```bash
curl -X POST "http://localhost:3000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass@123"}'
```

### Login

```bash
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass@123"}'
```

### Upload PDF

```bash
curl -X POST "http://localhost:3000/api/v1/pdf/upload" \
  -H "Authorization: Bearer <accessToken>" \
  -F "file=@/absolute/path/file.pdf"
```

## Notes
- MCQ and Evaluation generation are async queue-backed operations.
- Poll list/details/result endpoints after queue submission.
- For automated testing, use the Postman collection at `postman/WILLOFIRE-backend.postman_collection.json`.
