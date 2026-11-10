
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Subject {
  id: number;
  name: string;
}

export interface Topic {
  id: number;
  name: string;
  syllabusType: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/subjects`);
  }

  getTopicsBySubject(subjectId: number): Observable<Topic[]> {
    return this.http.get<Topic[]>(
      `${this.apiUrl}/topics/subject/${subjectId}`
    );
  }
}
