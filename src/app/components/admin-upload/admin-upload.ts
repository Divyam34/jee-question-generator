
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  PdfService,
  PdfPageText,
  PdfPageImage,
  PdfQuestionImage,
  PdfQuestionRegion,
  SavedQuestion
} from '../../services/pdf';

import {
  SubjectService,
  Subject,
  Topic
} from '../../services/subject';

@Component({
  selector: 'app-admin-upload',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-upload.html',
  styleUrl: './admin-upload.css'
})
export class AdminUpload implements OnInit {

  selectedFile: File | null = null;
  isUploading = false;

  isExtracting = false;
  isExtractingQuestions = false;
  isSavingQuestions = false;
  isLoadingSavedQuestions = false;

  message = '';
  errorMessage = '';

  paperId: number | null = null;
  fileName = '';

  extractedPages: PdfPageText[] = [];
  extractedImages: PdfPageImage[] = [];

  questionRegions: PdfQuestionRegion[] = [];
  questionImages: PdfQuestionImage[] = [];

  // Questions retrieved from the database
  savedQuestions: SavedQuestion[] = [];

  examType = '';
  selectedSubjectId: number | null = null;
  selectedTopicId: number | null = null;
  difficulty = '';

  subjects: Subject[] = [];
  topics: Topic[] = [];

  constructor(
    private pdfService: PdfService,
    private subjectService: SubjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.subjectService.getSubjects().subscribe({
      next: (data) => {
        this.subjects = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.errorMessage = 'Failed to load subjects.';
      }
    });
  }

  onSubjectChange(): void {
    this.selectedTopicId = null;
    this.topics = [];

    if (this.selectedSubjectId === null) return;

    this.subjectService.getTopicsBySubject(this.selectedSubjectId).subscribe({
      next: (data) => {
        this.topics = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading topics:', error);
        this.errorMessage = 'Failed to load topics.';
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      this.message = '';
      this.errorMessage = '';

      this.paperId = null;
      this.fileName = '';

      this.extractedPages = [];
      this.extractedImages = [];
      this.questionRegions = [];
      this.questionImages = [];
      this.savedQuestions = [];

      console.log('Selected file:', this.selectedFile.name);
    }
  }

  uploadPdf(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a PDF file.';
      return;
    }

    if (this.isUploading) return;

    this.isUploading = true;
    this.message = '';
    this.errorMessage = '';

    this.pdfService.uploadPdf(this.selectedFile)
      .pipe(finalize(() => {
        this.isUploading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.paperId = response.paperId;
          this.fileName = response.fileName;
          this.message = response.message || 'PDF uploaded successfully.';

          this.extractedPages = [];
          this.extractedImages = [];
          this.questionRegions = [];
          this.questionImages = [];
          this.savedQuestions = [];

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('PDF upload error:', error);
          this.errorMessage =
            error.error?.message || 'Failed to upload PDF.';
        }
      });
  }

  extractText(): void {
    if (this.paperId === null) {
      this.errorMessage = 'Please upload a PDF first.';
      return;
    }

    this.isExtracting = true;
    this.message = '';
    this.errorMessage = '';

    this.pdfService.extractText(this.paperId)
      .pipe(finalize(() => {
        this.isExtracting = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.extractedPages = response.pages;
          this.extractedImages = response.images;
          this.message = 'PDF text and pages extracted successfully.';
        },
        error: (error) => {
          console.error('PDF extraction error:', error);
          this.errorMessage =
            error.error?.message || 'Failed to extract PDF text.';
        }
      });
  }

  extractQuestions(): void {
    if (this.paperId === null) {
      this.errorMessage = 'Please upload a PDF first.';
      return;
    }

    this.isExtractingQuestions = true;
    this.message = '';
    this.errorMessage = '';

    this.pdfService.extractQuestionImages(this.paperId)
      .pipe(finalize(() => {
        this.isExtractingQuestions = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.questionRegions = response.questions;
          this.questionImages = response.images;

          this.message =
            `${response.images.length} question images extracted.`;
        },
        error: (error) => {
          console.error('Question extraction error:', error);
          this.errorMessage =
            error.error?.message || 'Failed to extract questions.';
        }
      });
  }

  saveExtractedQuestions(): void {
    if (this.paperId === null) {
      this.errorMessage = 'Please upload a PDF first.';
      return;
    }

    if (
      !this.examType ||
      this.selectedSubjectId === null ||
      this.selectedTopicId === null ||
      !this.difficulty
    ) {
      this.errorMessage = 'Please select all exam details.';
      return;
    }

    this.isSavingQuestions = true;
    this.message = '';
    this.errorMessage = '';
    this.savedQuestions = [];

    this.pdfService.saveExtractedQuestions(
      this.paperId,
      this.examType,
      this.selectedSubjectId,
      this.selectedTopicId,
      this.difficulty
    )
      .pipe(finalize(() => {
        this.isSavingQuestions = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.message =
            `${response.savedCount} questions saved successfully.`;

          // Fetch actual saved records from the database
          this.loadSavedQuestions();
        },
        error: (error) => {
          console.error('Saving questions error:', error);
          this.errorMessage =
            error.error?.message || 'Failed to save questions.';
        }
      });
  }

  // Fetch saved questions for the uploaded PDF
  loadSavedQuestions(): void {
    if (this.paperId === null) return;

    this.isLoadingSavedQuestions = true;

    this.pdfService.getSavedQuestions(this.paperId)
      .pipe(finalize(() => {
        this.isLoadingSavedQuestions = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (questions) => {
          this.savedQuestions = questions;

          this.message =
            `${questions.length} saved questions loaded from database.`;
        },
        error: (error) => {
          console.error('Fetching saved questions failed:', error);
          this.errorMessage =
            'Questions were saved, but failed to load their details.';
        }
      });
  }

  getImageUrl(pageNumber: number): string {
    if (this.paperId === null) return '';

    return this.pdfService.getImageUrl(
      this.paperId,
      pageNumber
    );
  }

  getQuestionImageUrl(image: PdfQuestionImage): string {
    if (this.paperId === null) return '';

    return this.pdfService.getQuestionImageUrl(
      this.paperId,
      image.imagePath
    );
  }

  getSavedQuestionImageUrl(question: SavedQuestion): string {
    if (this.paperId === null || !question.imagePath) return '';

    return this.pdfService.getQuestionImageUrl(
      this.paperId,
      question.imagePath
    );
  }

  getSavedDiagramUrl(question: SavedQuestion): string {
    if (this.paperId === null || !question.diagramPath) return '';

    return this.pdfService.getDiagramImageUrl(
      this.paperId,
      question.diagramPath
    );
  }

  getLatex(question: SavedQuestion): string {
    if (!question.mathExpressionsJson) return '';

    try {
      const result = JSON.parse(question.mathExpressionsJson);
      return result.latex || '';
    } catch {
      return question.mathExpressionsJson;
    }
  }
}
