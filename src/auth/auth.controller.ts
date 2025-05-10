import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { LoginDTO } from './dto/login.dto';
import { newPasswordDTO } from './dto/newPassword.dto';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDTO) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('send-otp')
  async sendVerificationEmail(@Body('email') email: string) {
    return await this.authService.sendVerificationEmail(email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.authService.verifyOtp(email, otp);
  }

  @Post('forget-password')
  async forgetPassword(@Body('email') email: string) {
    return await this.authService.forgetPassword(email);
  }

  @Post('reset-password/:token')
  async resetPassword(
    @Body() newPassword: newPasswordDTO,
    @Param('token') token: string,
  ) {
    return this.authService.resetPassword(token, newPassword.password);
  }
}
