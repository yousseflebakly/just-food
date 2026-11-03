
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

interface AdminJwtPayload {
  sub: number;
  email: string;
  role?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token is required');
    }

    const token = authorization.slice(7);

    let payload: AdminJwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<AdminJwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (
      !Number.isInteger(payload.sub) ||
      typeof payload.email !== 'string'
    ) {
      throw new UnauthorizedException('Invalid access token payload');
    }

    if (payload.role && payload.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
      },
    });

    if (!admin || admin.email !== payload.email) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
