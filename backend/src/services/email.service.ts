import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

export function initializeEmailTransport() {
  if (env.NODE_ENV === 'production' && (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS)) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  Email service not configured. Email features will be disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || 'localhost',
    port: parseInt(env.SMTP_PORT || '587'),
    secure: env.SMTP_PORT === '465',
    auth: env.SMTP_USER
      ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        }
      : undefined,
  });

  return transporter;
}

export async function sendVerificationEmail(email: string, token: string) {
  if (!transporter) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  Email transporter not initialized. Skipping verification email.');
    return;
  }

  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM || 'noreply@tracker.com',
      to: email,
      subject: 'Verify your email - Tracker',
      html: `
        <h2>Welcome to Tracker!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `,
      text: `Please verify your email by visiting: ${verificationUrl}\n\nThis link expires in 24 hours.`,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send verification email:', error);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!transporter) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  Email transporter not initialized. Skipping password reset email.');
    return;
  }

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM || 'noreply@tracker.com',
      to: email,
      subject: 'Reset your password - Tracker',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link expires in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email or reset your password immediately.</p>
      `,
      text: `Please reset your password by visiting: ${resetUrl}\n\nThis link expires in 30 minutes.`,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send password reset email:', error);
  }
}
