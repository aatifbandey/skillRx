import { Controller, Get, Param, Res } from '@nestjs/common';
import { join } from 'path';

@Controller()
export class WebController {
  @Get('/')
  public index(@Res() res: { sendFile: (path: string) => void }): void {
    res.sendFile(join(process.cwd(), 'public', 'index.html'));
  }

  @Get('/test/:id')
  public testPage(@Param('id') _id: string, @Res() res: { sendFile: (path: string) => void }): void {
    res.sendFile(join(process.cwd(), 'public', 'test.html'));
  }
}
