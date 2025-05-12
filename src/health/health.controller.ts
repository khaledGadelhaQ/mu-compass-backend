import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('health')
@Public()
export class HealthController {
  // Health check endpoints
  @Get()
  check() {
    return { status: 'OK', message: 'API is running 🚀' };
  }

  @Get('/homePage')
  homePage() {
    return  { status: 'OK', messagee: 'Welcome to HomePage ☺️'};
  }

  @Get('/dashboard')
  dashboard() {
    return { status: 'OK', message: 'Welcome to Dashboard ☺️' };
  }
}
