import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const from = this.configService.get<string>('EMAIL_FROM');

    const mailOptions = {
      from,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error('Could not send email.');
    }
  }

  async sendOtpVerificationEmail(user: { email: string }, otp: string) {
    const subject = 'Email Verification - CampussGo';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px; color: #333;">
        <h1 style="text-align: center; color: #4A86E8;">Verify Your University Email</h1>
        <p>Hi there,</p>
        <p>Thank you for registering with CampussGo - your campus companion! Please verify your university email address by entering the following verification code:</p>
        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 24px; font-weight: bold; background-color: #e8f0fe; padding: 10px; border-radius: 5px;">${otp}</p>
        </div>
        <p><strong>Note:</strong> This verification code is valid for 10 minutes only.</p>
        <p>If you did not request this verification, please ignore this email or contact our support team.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">CampussGo - Connecting university students across campus</p>
      </div>
    `;

    await this.sendEmail({ to: user.email, subject, html });
  }

  async sendResetPasswordEmail(user: { email: string }, url: string) {
    const subject = 'Reset Your Password - CampussGo';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px; color: #333;">
        <h1 style="text-align: center; color: #4A86E8;">Reset Your Password</h1>
        <p>Hi there,</p>
        <p>We received a request to reset your password for your CampussGo account. Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${url}" style="background-color: #4A86E8; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Reset Password</a>
        </div>
        <p><strong>Note:</strong> This link is valid for 10 minutes only.</p>
        <p>If you did not request this password reset, please ignore this email or contact our support team.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">If the button above doesn't work, paste this link into your web browser:</p>
        <p style="font-size: 12px; color: #666; word-wrap: break-word;">${url}</p>
        <p style="font-size: 12px; color: #666;">CampussGo - Connecting university students across campus</p>
      </div>
    `;

    await this.sendEmail({ to: user.email, subject, html });
  }

  async sendPasswordResetConfirmation(email: string) {
    const subject = 'Password Reset Successful - CampussGo';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px; color: #333;">
        <h1 style="text-align: center; color: #4A86E8;">Password Reset Successful</h1>
        <p>Hi there,</p>
        <p>Your password for CampussGo has been reset successfully. You can now login with your new password.</p>
        <p>If you did not make this change, please contact our support team immediately to secure your account.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">CampussGo - Connecting university students across campus</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }
}
