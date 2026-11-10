
import { Routes } from '@angular/router';

import { Home } from './components/home/home';
import { Dashboard } from './components/dashboard/dashboard';
import { QuestionGenerator } from './components/question-generator/question-generator';
import { AdminUpload } from './components/admin-upload/admin-upload';
import { ExamInstructions } from './components/exam-instructions/exam-instructions';
import { Exam } from './components/exam/exam';


export const routes: Routes = [

  {
    path: '',
    component: Home
  },

  {
    path: 'dashboard',
    component: QuestionGenerator
  },


  {
    path: 'admin',
    component: AdminUpload
  },

  {
    path: 'instructions',
    component: ExamInstructions
  },

  {
    path: 'exam',
    component: Exam
  },

  

  {
    path: '**',
    redirectTo: ''
  }

];
