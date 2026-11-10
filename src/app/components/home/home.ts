
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy, AfterViewInit {

  currentSlide = 0;
  openFaq: number | null = 0;
  currentYear = new Date().getFullYear();

  private carouselInterval?: ReturnType<typeof setInterval>;
  private observer?: IntersectionObserver;

  slides = [
    {
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=85',
      label: 'YOUR LEARNING JOURNEY',
      title: 'Learn Smarter',
      description: 'Build strong concepts for your JEE journey.'
    },
    {
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=85',
      label: 'PRACTICE EVERY DAY',
      title: 'Practice Better',
      description: 'Improve your accuracy with real question papers.'
    },
    {
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=85',
      label: 'ACHIEVE YOUR GOALS',
      title: 'Achieve More',
      description: 'Turn your IIT dream into reality.'
    },
    {
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=85',
      label: 'YOUR FUTURE STARTS HERE',
      title: 'Your Future Begins Here',
      description: 'Prepare with confidence every day.'
    }
  ];

  subjects = [
    {
      name: 'Physics',
      number: 'SUBJECT 01',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=85',
      description: 'Understand concepts and solve numerical problems.'
    },
    {
      name: 'Chemistry',
      number: 'SUBJECT 02',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=85',
      description: 'Strengthen your theoretical and practical understanding.'
    },
    {
      name: 'Mathematics',
      number: 'SUBJECT 03',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=85',
      description: 'Improve logical thinking and problem-solving skills.'
    }
  ];

  faqs = [
    {
      question: 'What is this platform?',
      answer: 'This platform helps JEE aspirants practise questions from uploaded JEE question papers and prepare systematically for JEE Main and Advanced.'
    },
    {
      question: 'Does the platform support JEE Main and Advanced?',
      answer: 'Yes. The platform is designed to support preparation for both JEE Main and JEE Advanced.'
    },
    {
      question: 'Can I practise subject-wise questions?',
      answer: 'Yes. You can explore Physics, Chemistry and Mathematics question sections.'
    },
    {
      question: 'Are questions generated from uploaded PDFs?',
      answer: 'Questions are extracted from uploaded question-paper PDFs. Original question content and associated diagrams should be preserved.'
    }
  ];

  ngOnInit(): void {
    this.startCarousel();
  }

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('show');
              this.observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      document.querySelectorAll('.reveal').forEach(element => {
        this.observer?.observe(element);
      });
    }
  }

  startCarousel(): void {
    this.stopCarousel();

    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  stopCarousel(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = undefined;
    }
  }

  nextSlide(): void {
    this.currentSlide =
      (this.currentSlide + 1) % this.slides.length;
  }

  previousSlide(): void {
    this.currentSlide =
      (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  toggleFaq(index: number): void {
    this.openFaq = this.openFaq === index ? null : index;
  }

  ngOnDestroy(): void {
    this.stopCarousel();
    this.observer?.disconnect();
  }
}
