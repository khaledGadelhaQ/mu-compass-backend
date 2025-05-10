import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  // Health check endpoint
  @Get()
  check() {
    return { status: 'OK', message: 'API is running 🚀' };
  }
}
