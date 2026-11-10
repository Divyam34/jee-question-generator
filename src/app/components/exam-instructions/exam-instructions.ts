
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exam-instructions',
  standalone: true,
  imports: [],
  templateUrl: './exam-instructions.html',
  styleUrl: './exam-instructions.css'
})
export class ExamInstructions implements OnInit {

  questionCount: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const storedQuestions = sessionStorage.getItem('jeeQuestions');

    if (storedQuestions) {
      const questions = JSON.parse(storedQuestions);
      this.questionCount = questions.length;
    }
  }

  startTest(): void {
    if (this.questionCount === 0) {
      alert('No questions found. Please generate questions first.');
      this.router.navigate(['/generate']);
      return;
    }

    this.router.navigate(['/exam']);
  }

}
