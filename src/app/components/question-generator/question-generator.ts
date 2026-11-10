
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SubjectService, Subject, Topic } from '../../services/subject';
import { QuestionService, Question } from '../../services/question';

import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-question-generator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question-generator.html',
  styleUrl: './question-generator.css'
})
export class QuestionGenerator implements OnInit {

  subjects: Subject[] = [];
  topics: Topic[] = [];
  questions: Question[] = [];

  selectedExam = '';
  selectedSubjectId: number | null = null;
  selectedTopicId: number | null = null;
  selectedDifficulty = '';

  questionCount = 5;

  isLoading = false;
  isTopicsLoading = false;

  errorMessage = '';

  private topicRequestId = 0;

  constructor(
    private subjectService: SubjectService,
    private questionService: QuestionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  // Load subjects
  loadSubjects(): void {

    this.subjectService.getSubjects().subscribe({

      next: (data: Subject[]) => {

        this.subjects = data || [];

        console.log('Subjects loaded:', this.subjects);

      },

      error: (error) => {

        console.error('Subject API error:', error);

        this.errorMessage = 'Failed to load subjects.';

      }

    });
  }

  // Load topics when subject changes
  onSubjectChange(event: Event): void {

    const value = (event.target as HTMLSelectElement).value;

    this.selectedSubjectId = value ? Number(value) : null;

    this.selectedTopicId = null;
    this.topics = [];

    this.errorMessage = '';

    const requestId = ++this.topicRequestId;

    if (this.selectedSubjectId === null) {

      this.isTopicsLoading = false;

      return;
    }

    this.isTopicsLoading = true;

    console.log(
      'Loading topics for subject:',
      this.selectedSubjectId
    );

    this.subjectService
      .getTopicsBySubject(this.selectedSubjectId)
      .pipe(
        finalize(() => {
          if (requestId === this.topicRequestId) {
            this.isTopicsLoading = false;
          }
        })
      )
      .subscribe({

        next: (response: any) => {

          if (requestId !== this.topicRequestId) {
            return;
          }

          // Support both array and paginated API responses
          const topicData = Array.isArray(response)
            ? response
            : response?.content || response?.data || [];

          this.topics = topicData;

          console.log('Topics loaded:', this.topics);

          if (this.topics.length === 0) {
            console.log('No topics found for this subject.');
          }

        },

        error: (error) => {

          if (requestId !== this.topicRequestId) {
            return;
          }

          console.error('Topic API error:', error);

          this.topics = [];

          this.errorMessage =
            'Failed to load topics. Please try again.';

        }

      });
  }

  // Filter topics based on selected exam
  get filteredTopics(): Topic[] {

    if (!this.selectedExam) {
      return this.topics;
    }

    const exam = this.selectedExam.trim().toUpperCase();

    return this.topics.filter(topic => {

      const syllabus = String(topic.syllabusType || '')
        .trim()
        .toUpperCase();

      // Show all topics if syllabus information is missing
      if (!syllabus) {
        return true;
      }

      return syllabus === exam || syllabus === 'BOTH';

    });
  }

  // Exam selection
  onExamChange(event: Event): void {

    this.selectedExam =
      (event.target as HTMLSelectElement).value;

    this.selectedTopicId = null;

    console.log('Selected exam:', this.selectedExam);

  }

  // Topic selection
  onTopicChange(event: Event): void {

    const value = (event.target as HTMLSelectElement).value;

    this.selectedTopicId = value ? Number(value) : null;

    console.log('Selected topic ID:', this.selectedTopicId);

  }

  // Difficulty selection
  onDifficultyChange(event: Event): void {

    this.selectedDifficulty =
      (event.target as HTMLSelectElement).value;

    console.log('Selected difficulty:', this.selectedDifficulty);

  }

  // Question count selection
  onQuestionCountChange(event: Event): void {

    this.questionCount = Number(
      (event.target as HTMLSelectElement).value
    );

  }

  // Generate questions
  onGenerateQuestions(): void {

    if (
      !this.selectedExam ||
      this.selectedSubjectId === null ||
      this.selectedTopicId === null ||
      !this.selectedDifficulty
    ) {

      this.errorMessage = 'Please select all options.';

      return;
    }

    this.isLoading = true;

    this.errorMessage = '';

    console.log('========== GENERATE QUESTIONS ==========');

    console.log('Exam Type:', this.selectedExam);
    console.log('Subject ID:', this.selectedSubjectId);
    console.log('Topic ID:', this.selectedTopicId);
    console.log('Difficulty:', this.selectedDifficulty);
    console.log('Question Count:', this.questionCount);

    this.questionService.generateQuestions(
      this.selectedExam,
      this.selectedSubjectId,
      this.selectedTopicId,
      this.selectedDifficulty,
      this.questionCount
    ).subscribe({

      next: (data: Question[]) => {

        console.log('API Response:', data);

        this.isLoading = false;

        if (!data || data.length === 0) {

          this.errorMessage =
            'No matching questions found. Check your selected options.';

          return;
        }

        this.questions = data;

        sessionStorage.setItem(
          'jeeQuestions',
          JSON.stringify(this.questions)
        );

        console.log(
          'Questions stored successfully:',
          this.questions
        );

        this.router.navigate(['/exam']);

      },

      error: (error) => {

        console.error('Generate API Error:', error);

        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          'Failed to generate questions.';

      }

    });
  }
}
