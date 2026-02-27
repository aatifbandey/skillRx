import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { TestsService } from './tests.service';

interface CreateTestRequest {
  title?: string;
  questions?: Array<{ prompt?: string; correctAnswer?: string }>;
}

interface SubmitTestRequest {
  candidateName?: string;
  answers?: unknown;
}

@Controller('api/tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  public createTest(@Body() body: CreateTestRequest): { message: string; testId: string; shareUrl: string } {
    try {
      const output = this.testsService.createTest(body);
      return {
        message: 'Test created successfully.',
        testId: output.testId,
        shareUrl: output.shareUrl
      };
    } catch (error) {
      throw new HttpException(
        { error: error instanceof Error ? error.message : 'Unable to create test.' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get(':id')
  public getTest(@Param('id') id: string): { id: string; title: string; questions: Array<{ id: number; prompt: string }> } {
    try {
      return this.testsService.getTestForCandidate(id);
    } catch (error) {
      throw new HttpException(
        { error: error instanceof Error ? error.message : 'Unable to fetch test.' },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Post(':id/submit')
  public submitTest(
    @Param('id') id: string,
    @Body() body: SubmitTestRequest
  ): { message: string; candidateName: string; correct: number; total: number; percentage: number } {
    try {
      const output = this.testsService.submitAnswers(id, body.candidateName, body.answers);
      return {
        message: 'Submission received.',
        candidateName: output.candidateName,
        correct: output.result.correct,
        total: output.result.total,
        percentage: output.result.percentage
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit test.';
      const status = message === 'Test not found.' ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
      throw new HttpException({ error: message }, status);
    }
  }
}
