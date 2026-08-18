import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword, comparePassword } from './hash.utils';
import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

@Injectable()
export class AuthService {
  // In-memory OTP storage: phone -> { code, expiresAt }
  private otpStore = new Map<string, { code: string; expiresAt: number }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(emailOrPhone: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone },
        ],
      },
    });

    if (user && user.password && comparePassword(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        trialEndDate: user.trialEndDate,
        xpPoints: user.xpPoints,
        streakCount: user.streakCount,
        coins: user.coins,
        referralCode: user.referralCode,
      },
    };
  }

  async register(data: { name: string; email?: string; phone: string; password?: string; role?: string; referralCode?: string }) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          ...(data.email ? [{ email: data.email }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Email or phone already registered');
    }

    const hashedPasswordString = data.password ? hashPassword(data.password) : null;
    
    // Automatically set up 2-Day Free Trial
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 2);

    // Generate unique referral code
    const generatedRefCode = data.name.split(' ')[0].toUpperCase() + Math.floor(1000 + Math.random() * 9000);

    // Check if referred by someone
    let referredById: string | null = null;
    if (data.referralCode) {
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode: data.referralCode }
      });
      if (referrer) {
        referredById = referrer.id;
        // Reward referrer with 50 coins
        await this.prisma.user.update({
          where: { id: referrer.id },
          data: { coins: { increment: 50 } }
        });
      }
    }

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        password: hashedPasswordString,
        role: data.role || 'STUDENT',
        trialEndDate,
        referralCode: generatedRefCode,
        referredById,
        coins: referredById ? 25 : 0 // Reward new user with 25 coins if referred
      },
    });

    return this.login(user);
  }

  async requestOtp(phone: string) {
    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins expiry
    this.otpStore.set(phone, { code, expiresAt });

    // Local simulation alert
    console.log(`[OTP ALERT] SMS to ${phone}: Use OTP ${code} to log in. Expires in 5m.`);
    
    return {
      message: 'OTP sent successfully',
      debugCode: code, // Returned for easy local mockup testing
    };
  }

  async verifyOtp(phone: string, code: string) {
    const stored = this.otpStore.get(phone);
    if (!stored) {
      throw new UnauthorizedException('No OTP requested for this phone');
    }

    if (Date.now() > stored.expiresAt) {
      this.otpStore.delete(phone);
      throw new UnauthorizedException('OTP has expired');
    }

    if (stored.code !== code) {
      throw new UnauthorizedException('Invalid OTP');
    }

    this.otpStore.delete(phone);

    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 2);
      const generatedRefCode = 'USER' + Math.floor(100000 + Math.random() * 900000);

      user = await this.prisma.user.create({
        data: {
          name: `Student ${phone.slice(-4)}`,
          phone,
          role: 'STUDENT',
          trialEndDate,
          referralCode: generatedRefCode
        },
      });
    }

    return this.login(user);
  }

  async googleLogin(body: { token?: string; email?: string; name?: string }) {
    let email = body.email;
    let name = body.name;

    if (body.token) {
      let isFirebase = false;
      let firebasePayload: any = null;
      try {
        const payload = JSON.parse(Buffer.from(body.token.split('.')[1], 'base64').toString());
        if (payload && payload.iss && payload.iss.includes("securetoken.google.com")) {
          isFirebase = true;
          firebasePayload = payload;
        }
      } catch (e) {}

      if (isFirebase && firebasePayload) {
        const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
        if (firebaseProjectId) {
          if (firebasePayload.aud !== firebaseProjectId) {
            throw new UnauthorizedException('Invalid Firebase token audience');
          }
          if (firebasePayload.iss !== `https://securetoken.google.com/${firebaseProjectId}`) {
            throw new UnauthorizedException('Invalid Firebase token issuer');
          }
        }
        email = firebasePayload.email;
        name = firebasePayload.name || (firebasePayload.email ? firebasePayload.email.split('@')[0] : 'Google User');
      } else if (googleClient) {
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: body.token,
            audience: googleClientId,
          });
          const payload = ticket.getPayload();
          if (payload) {
            email = payload.email;
            name = payload.name;
          }
        } catch (error) {
          throw new UnauthorizedException('Invalid Google token signature');
        }
      } else {
        // Fallback: decode JWT payload without verification for local mock simulation
        try {
          const payload = JSON.parse(Buffer.from(body.token.split('.')[1], 'base64').toString());
          email = payload.email;
          name = payload.name || (payload.email ? payload.email.split('@')[0] : 'Google User');
        } catch (err) {
          // Fallback to arguments
        }
      }
    }

    if (!email || !name) {
      throw new UnauthorizedException('Google identity details not available');
    }

    let user = await this.prisma.user.findFirst({
      where: { email: email },
    });

    if (!user) {
      const syntheticPhone = 'G-' + Math.floor(10000000 + Math.random() * 90000000).toString();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 2);
      const generatedRefCode = name.split(' ')[0].toUpperCase() + Math.floor(1000 + Math.random() * 9000);

      user = await this.prisma.user.create({
        data: {
          name: name,
          email: email,
          phone: syntheticPhone,
          role: 'STUDENT',
          trialEndDate,
          referralCode: generatedRefCode
        },
      });
    }

    return this.login(user);
  }
}
