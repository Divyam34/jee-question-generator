
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Question {
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

  // Original question image
  imagePath: string | null;

  // Separately extracted diagram
  diagramPath: string | null;

  // Mathematical OCR result
  mathExpressionsJson: string | null;

  paperId: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private apiUrl = 'http://localhost:8080/api/questions';

  private adminApiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  // Generate questions from saved PDF-extracted questions
  generateQuestions(
    examType: string,
    subjectId: number,
    topicId: number,
    difficulty: string,
    questionCount: number
  ): Observable<Question[]> {

    const params = new HttpParams()
      .set('examType', examType)
      .set('subjectId', subjectId)
      .set('topicId', topicId)
      .set('difficulty', difficulty)
      .set('questionCount', questionCount);

    return this.http.get<Question[]>(
      `${this.apiUrl}/generate`,
      { params }
    );
  }

  // Get complete question image URL
  getQuestionImageUrl(question: Question): string | null {

    if (!question.imagePath || !question.paperId) {
      return null;
    }

    return `${this.adminApiUrl}/question-images/${question.paperId}/${encodeURIComponent(question.imagePath)}`;
  }

  // Get separately extracted diagram URL
  getQuestionDiagramUrl(question: Question): string | null {

    if (!question.diagramPath || !question.paperId) {
      return null;
    }

    return `${this.adminApiUrl}/question-diagrams/${question.paperId}/${encodeURIComponent(question.diagramPath)}`;
  }

}
