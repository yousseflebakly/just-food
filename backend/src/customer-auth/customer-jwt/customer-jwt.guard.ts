
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

interface CustomerJwtPayload {
  sub: number;
  email: string;
  role: string;
}

interface AuthenticatedCustomer {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
}

export interface CustomerRequest extends Request {
  customer?: AuthenticatedCustomer;
}

@Injectable()
export class CustomerJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<CustomerRequest>();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        'Customer authentication is required',
      );
    }

    const [type, token, extra] = authorization.split(' ');

    if (type !== 'Bearer' || !token || extra) {
      throw new UnauthorizedException(
        'Invalid authorization header',
      );
    }

    let payload: CustomerJwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<CustomerJwtPayload>(
        token,
        {
          secret: process.env.CUSTOMER_JWT_SECRET,
          algorithms: ['HS256'],
        },
      );
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired customer token',
      );
    }

    if (
      payload.role !== 'customer' ||
      !Number.isInteger(payload.sub) ||
      payload.sub <= 0 ||
      typeof payload.email !== 'string'
    ) {
      throw new UnauthorizedException(
        'Invalid customer token payload',
      );
    }

    const customer = await this.prisma.customer.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        isActive: true,
      },
    });

    if (
      !customer ||
      !customer.isActive ||
      customer.email !== payload.email
    ) {
      throw new UnauthorizedException(
        'Customer account is invalid or inactive',
      );
    }

    request.customer = {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
    };

    return true;
  }
}
