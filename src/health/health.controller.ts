import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('health')
@Public()
export class HealthController {
  // Health check endpoint
  @Get()
  check() {
    return { status: 'OK', message: 'API is running 🚀' };
  }
}
