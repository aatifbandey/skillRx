import { Module } from '@nestjs/common';
import { TestsController } from './tests/tests.controller';
import { WebController } from './web.controller';
import { TestsService } from './tests/tests.service';

@Module({
  imports: [],
  controllers: [TestsController, WebController],
  providers: [TestsService]
})
export class AppModule {}
