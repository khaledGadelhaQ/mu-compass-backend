import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../common/services/email';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from 'src/users/schemas/user.schema';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(user: UserDocument) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    if (!user.isVerified) {
      throw new UnauthorizedException('Verify your email to get full access!');
    }
    const accessToken = await this.generateToken(user);
    return {
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken,
        expiresIn: 3600,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  async sendVerificationEmail(email: string) {
    const user = await this.usersService.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified.');
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the OTP for secure storage
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Set expiration time (e.g., 10 minutes from now)
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    await this.usersService.update(user.id, {
      verificationOtp: hashedOtp,
      verificationOtpExpires: otpExpires,
    });

    await this.emailService.sendOtpVerificationEmail(user, otp);

    return {
      status: 'success',
      message: 'Verification OTP sent successfully. Please check your email.',
    };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.usersService.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
  
    if (user.isVerified) {
      throw new BadRequestException('Email is already verified.');
    }
  
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  
    if (
      user.verificationOtp !== hashedOtp ||
      user.verificationOtpExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired OTP.');
    }
  
    await this.usersService.update(user.id, {
      isVerified: true,
      verificationOtp: null,
      verificationOtpExpires: null,
    });

    const accessToken = await this.generateToken(user);
  
    return {
      status: 'success',
      message: 'Email verified successfully!',
      data: {
        accessToken,
        expiresIn: 3600,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  async forgetPassword(email: string) {
    const user = await this.usersService.findOne({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const token = await user.createResetPasswordToken();

    const baseURL = this.configService.get<string>('APP_URL');
    const resetPasswordEmailURL = `${baseURL}auth/reset-password/${token}`;
    // send the resetYourPassword email
    await this.emailService.sendResetPasswordEmail(user, resetPasswordEmailURL);

    return {
      status: 'success',
      message:
        'A password reset email has been sent to your email address. Please check your inbox.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw new BadRequestException('Token is invalid or has expired');
    }

    await this.usersService.update(user.id, {
      password: newPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    await this.emailService.sendPasswordResetConfirmation(user.email);
    return {
      status: 'success',
      message:
        'Your password has been reset successfully! You can now log in with your new password.',
    };
  }

}
