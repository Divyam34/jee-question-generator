import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExamInstructions } from './exam-instructions';

describe('ExamInstructions', () => {
  let component: ExamInstructions;
  let fixture: ComponentFixture<ExamInstructions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamInstructions],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamInstructions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
