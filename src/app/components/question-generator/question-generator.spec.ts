import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionGenerator } from './question-generator';

describe('QuestionGenerator', () => {
  let component: QuestionGenerator;
  let fixture: ComponentFixture<QuestionGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionGenerator],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionGenerator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
