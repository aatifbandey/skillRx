import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { TestRecord, TestsDb, SubmissionResult } from './tests.types';

interface CreateQuestionInput {
  prompt?: string;
  correctAnswer?: string;
}

interface CreateTestInput {
  title?: string;
  questions?: CreateQuestionInput[];
}

@Injectable()
export class TestsService {
  private readonly dataDir = join(process.cwd(), 'data');
  private readonly testsFile = join(this.dataDir, 'tests.json');

  public createTest(input: CreateTestInput): { testId: string; shareUrl: string } {
    const title = (input.title ?? '').trim();
    const questions = Array.isArray(input.questions) ? input.questions : [];

    if (!title) {
      throw new Error('Test title is required.');
    }

    if (questions.length === 0) {
      throw new Error('At least one question is required.');
    }

    const normalizedQuestions = questions
      .map((q, index) => ({
        id: index + 1,
        prompt: (q.prompt ?? '').trim(),
        correctAnswer: (q.correctAnswer ?? '').trim()
      }))
      .filter((q) => q.prompt.length > 0 && q.correctAnswer.length > 0);

    if (normalizedQuestions.length === 0) {
      throw new Error('Each question must include prompt and correct answer.');
    }

    const testId = randomBytes(6).toString('hex');
    const db = this.readTests();
    const record: TestRecord = {
      id: testId,
      title,
      questions: normalizedQuestions,
      submissions: [],
      createdAt: new Date().toISOString()
    };

    db.tests.push(record);
    this.writeTests(db);

    return { testId, shareUrl: `/test/${testId}` };
  }

  public getTestForCandidate(testId: string): { id: string; title: string; questions: Array<{ id: number; prompt: string }> } {
    const test = this.findTestById(testId);

    if (!test) {
      throw new Error('Test not found.');
    }

    return {
      id: test.id,
      title: test.title,
      questions: test.questions.map((question) => ({ id: question.id, prompt: question.prompt }))
    };
  }

  public submitAnswers(testId: string, candidateNameRaw: string | undefined, answersRaw: unknown): { candidateName: string; result: SubmissionResult } {
    const candidateName = (candidateNameRaw ?? '').trim();
    const answers = Array.isArray(answersRaw) ? answersRaw.map((value) => String(value ?? '')) : [];

    if (!candidateName) {
      throw new Error('Candidate name is required.');
    }

    const db = this.readTests();
    const test = db.tests.find((item) => item.id === testId);

    if (!test) {
      throw new Error('Test not found.');
    }

    const result = this.scoreSubmission(test, answers);
    test.submissions.push({
      id: randomBytes(4).toString('hex'),
      candidateName,
      answers,
      result,
      submittedAt: new Date().toISOString()
    });

    this.writeTests(db);

    return { candidateName, result };
  }

  private scoreSubmission(test: TestRecord, answers: string[]): SubmissionResult {
    let correct = 0;

    test.questions.forEach((question, index) => {
      const submitted = (answers[index] ?? '').trim().toLowerCase();
      const expected = question.correctAnswer.trim().toLowerCase();

      if (submitted === expected) {
        correct += 1;
      }
    });

    const total = test.questions.length;
    const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

    return { correct, total, percentage };
  }

  private findTestById(testId: string): TestRecord | undefined {
    const db = this.readTests();
    return db.tests.find((item) => item.id === testId);
  }

  private ensureStorage(): void {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }

    if (!existsSync(this.testsFile)) {
      const initialState: TestsDb = { tests: [] };
      writeFileSync(this.testsFile, JSON.stringify(initialState, null, 2));
    }
  }

  private readTests(): TestsDb {
    this.ensureStorage();
    const content = readFileSync(this.testsFile, 'utf8');
    return JSON.parse(content) as TestsDb;
  }

  private writeTests(db: TestsDb): void {
    writeFileSync(this.testsFile, JSON.stringify(db, null, 2));
  }
}
