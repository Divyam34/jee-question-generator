
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Extracted PDF page text
export interface PdfPageText {
  pageNumber: number;
  extractedText: string;
}

// Full PDF page image
export interface PdfPageImage {
  pageNumber: number;
  imagePath: string;
}

// PDF upload response
export interface PdfUploadResponse {
  message: string;
  paperId: number;
  fileName: string;
}

// Detected question region
export interface PdfQuestionRegion {
  questionNumber: number;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  questionText: string;
}

// Cropped question image
export interface PdfQuestionImage {
  questionNumber: number;
  pageNumber: number;
  imagePath: string;
}

// Question image extraction response
export interface PdfQuestionExtractionResponse {
  paperId: number;
  fileName: string;
  questions: PdfQuestionRegion[];
  images: PdfQuestionImage[];
}

// PDF text extraction response
export interface PdfExtractionResponse {
  paperId: number;
  fileName: string;
  pages: PdfPageText[];
  images: PdfPageImage[];
}

// Save extracted questions response
export interface PdfQuestionSaveResponse {
  message: string;
  paperId: number;
  savedCount: number;
}

// Questions retrieved from database
export interface SavedQuestion {
  id: number;
  questionText: string;

  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;

  difficulty: string;
  questionType: string | null;

  pageNumber: number;
  questionNumber: number;

  imagePath: string | null;
  diagramPath: string | null;

  mathExpressionsJson: string | null;

  paperId: number;
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  private apiUrl = 'http://localhost:8080/api/admin';

  private questionApiUrl = 'http://localhost:8080/api/questions';

  constructor(private http: HttpClient) {}

  // Upload PDF
  uploadPdf(file: File): Observable<PdfUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<PdfUploadResponse>(
      `${this.apiUrl}/upload-pdf`,
      formData
    );
  }

  // Extract full PDF pages
  extractText(paperId: number): Observable<PdfExtractionResponse> {
    return this.http.get<PdfExtractionResponse>(
      `${this.apiUrl}/extract-text/${paperId}`
    );
  }

  // Extract individual question images
  extractQuestionImages(
    paperId: number
  ): Observable<PdfQuestionExtractionResponse> {
    return this.http.get<PdfQuestionExtractionResponse>(
      `${this.apiUrl}/extract-question-images/${paperId}`
    );
  }

  // Save extracted questions to database
  saveExtractedQuestions(
    paperId: number,
    examType: string,
    subjectId: number,
    topicId: number,
    difficulty: string
  ): Observable<PdfQuestionSaveResponse> {
    return this.http.post<PdfQuestionSaveResponse>(
      `${this.apiUrl}/save-extracted-questions/${paperId}`,
      null,
      {
        params: {
          examType,
          subjectId,
          topicId,
          difficulty
        }
      }
    );
  }

  // Fetch all saved questions for a particular PDF
  getSavedQuestions(paperId: number): Observable<SavedQuestion[]> {
    return this.http.get<SavedQuestion[]>(
      `${this.questionApiUrl}/paper/${paperId}`
    );
  }

  // Full PDF page image URL
  getImageUrl(paperId: number, pageNumber: number): string {
    return `${this.apiUrl}/images/${paperId}/page-${pageNumber}.png`;
  }

  // Individual question image URL
  getQuestionImageUrl(paperId: number, imagePath: string): string {
    const fileName = imagePath.split('/').pop();

    return `${this.apiUrl}/question-images/${paperId}/${fileName}`;
  }

  // Diagram image URL
  getDiagramImageUrl(paperId: number, diagramPath: string): string {
    const fileName = diagramPath.split('/').pop();

    return `${this.apiUrl}/question-diagrams/${paperId}/${fileName}`;
  }
}
