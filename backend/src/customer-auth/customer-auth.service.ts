
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

interface RegisterCustomerInput {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

interface LoginCustomerInput {
  email: string;
  password: string;
}

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterCustomerInput) {
    const fullName = input.fullName?.trim();
    const email = input.email?.trim().toLowerCase();
    const password = input.password;
    const phoneNumber = input.phoneNumber?.trim() || null;

    if (!fullName || fullName.length < 3) {
      throw new BadRequestException(
        'Full name must contain at least 3 characters',
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Invalid email address');
    }

    if (!password || password.length < 8) {
      throw new BadRequestException(
        'Password must contain at least 8 characters',
      );
    }

    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await this.prisma.customer.create({
      data: {
        fullName,
        email,
        phoneNumber,
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });

    const accessToken = await this.createAccessToken(
      customer.id,
      customer.email,
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
      customer,
    };
  }

  async login(input: LoginCustomerInput) {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!email || !password) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      customer.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    if (!customer.isActive) {
      throw new UnauthorizedException(
        'Customer account is inactive',
      );
    }

    const accessToken = await this.createAccessToken(
      customer.id,
      customer.email,
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        avatarUrl: customer.avatarUrl,
        emailVerifiedAt: customer.emailVerifiedAt,
        createdAt: customer.createdAt,
      },
    };
  }

  private async createAccessToken(
    customerId: number,
    email: string,
  ): Promise<string> {
    return this.jwtService.signAsync({
      sub: customerId,
      email,
      role: 'customer',
    });
  }
}
