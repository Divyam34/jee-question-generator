
import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  Question,
  QuestionService
} from '../../services/question';

@Component({
  selector: 'app-exam',
  standalone: true,
  imports: [],
  templateUrl: './exam.html',
  styleUrl: './exam.css'
})
export class Exam implements OnInit, OnDestroy {

  questions: Question[] = [];

  currentQuestionIndex = 0;

  selectedAnswers: { [key: number]: string } = {};

  visitedQuestions: number[] = [];

  markedForReview: number[] = [];

  // Three hours
  remainingSeconds = 3 * 60 * 60;

  timerInterval: ReturnType<typeof setInterval> | undefined;

  isSubmitted = false;

  constructor(
    private questionService: QuestionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const storedQuestions = sessionStorage.getItem('jeeQuestions');

    if (storedQuestions) {
      try {
        this.questions = JSON.parse(storedQuestions);
      } catch (error) {
        console.error('Failed to read exam questions:', error);
      }
    }

    if (this.questions.length === 0) {
      alert('No questions found. Please generate questions first.');
      return;
    }

    this.visitedQuestions.push(0);

    this.startTimer();
  }

  // Current question
  get currentQuestion(): Question | undefined {
    return this.questions[this.currentQuestionIndex];
  }

  // Diagram URL
  getQuestionDiagramUrl(question: Question): string | null {
    return this.questionService.getQuestionDiagramUrl(question);
  }

  // Diagram error
  onDiagramError(question: Question): void {
    console.error(
      'Question diagram failed to load:',
      this.getQuestionDiagramUrl(question)
    );
  }

  // Available options
  get currentOptions(): { key: string; value: string }[] {

    const question = this.currentQuestion;

    if (!question) {
      return [];
    }

    return [
      { key: 'A', value: question.optionA ?? '' },
      { key: 'B', value: question.optionB ?? '' },
      { key: 'C', value: question.optionC ?? '' },
      { key: 'D', value: question.optionD ?? '' }
    ].filter(option => option.value.trim() !== '');
  }

  // Start countdown timer
  startTimer(): void {

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.remainingSeconds = 3 * 60 * 60;

    this.timerInterval = setInterval(() => {

      if (this.isSubmitted) {
        return;
      }

      if (this.remainingSeconds > 0) {

        this.remainingSeconds--;

        // Update Angular view immediately
        this.cdr.detectChanges();

      }

      if (this.remainingSeconds === 0) {

        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = undefined;
        }

        this.submitTest();
      }

    }, 1000);
  }

  // Format HH:MM:SS
  get formattedTime(): string {

    const hours = Math.floor(this.remainingSeconds / 3600);

    const minutes = Math.floor(
      (this.remainingSeconds % 3600) / 60
    );

    const seconds = this.remainingSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // Select answer
  selectAnswer(answer: string): void {

    if (this.isSubmitted) return;

    this.selectedAnswers[this.currentQuestionIndex] = answer;
  }

  // Check selected answer
  isAnswerSelected(answer: string): boolean {
    return this.selectedAnswers[this.currentQuestionIndex] === answer;
  }

  // Navigate to question
  goToQuestion(index: number): void {

    if (
      index < 0 ||
      index >= this.questions.length ||
      this.isSubmitted
    ) {
      return;
    }

    this.currentQuestionIndex = index;

    if (!this.visitedQuestions.includes(index)) {
      this.visitedQuestions.push(index);
    }
  }

  // Save and next
  saveAndNext(): void {

    this.markedForReview = this.markedForReview.filter(
      index => index !== this.currentQuestionIndex
    );

    this.goToQuestion(this.currentQuestionIndex + 1);
  }

  // Previous question
  previousQuestion(): void {
    this.goToQuestion(this.currentQuestionIndex - 1);
  }

  // Mark for review
  markForReview(): void {

    if (this.isSubmitted) return;

    if (!this.markedForReview.includes(this.currentQuestionIndex)) {
      this.markedForReview.push(this.currentQuestionIndex);
    }

    this.goToQuestion(this.currentQuestionIndex + 1);
  }

  // Clear response
  clearResponse(): void {

    if (this.isSubmitted) return;

    delete this.selectedAnswers[this.currentQuestionIndex];
  }

  // Answered questions
  get answeredCount(): number {
    return Object.keys(this.selectedAnswers).length;
  }

  // Visited but unanswered
  get notAnsweredCount(): number {

    return this.visitedQuestions.filter(
      index => !this.selectedAnswers[index]
    ).length;
  }

  // Total unanswered
  get unansweredCount(): number {
    return this.questions.length - this.answeredCount;
  }

  // Submit exam
  submitTest(): void {

    if (this.isSubmitted) return;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }

    this.isSubmitted = true;

    const result = {
      questions: this.questions,
      selectedAnswers: this.selectedAnswers,
      answeredCount: this.answeredCount,
      totalQuestions: this.questions.length,
      submittedAt: new Date().toISOString()
    };

    sessionStorage.setItem(
      'jeeExamResult',
      JSON.stringify(result)
    );

    this.cdr.detectChanges();

    alert('Test submitted successfully!');
  }

  // Cleanup timer
  ngOnDestroy(): void {

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }
}
