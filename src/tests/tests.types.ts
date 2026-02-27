export interface Question {
  id: number;
  prompt: string;
  correctAnswer: string;
}

export interface SubmissionResult {
  correct: number;
  total: number;
  percentage: number;
}

export interface Submission {
  id: string;
  candidateName: string;
  answers: string[];
  result: SubmissionResult;
  submittedAt: string;
}

export interface TestRecord {
  id: string;
  title: string;
  questions: Question[];
  submissions: Submission[];
  createdAt: string;
}

export interface TestsDb {
  tests: TestRecord[];
}
