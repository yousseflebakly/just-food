import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly jwtService: JwtService,
) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Search for admin by email
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(
      password,
      admin.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const accessToken = await this.jwtService.signAsync({
  sub: admin.id,
  email: admin.email,
});

return {
  accessToken,
  tokenType: 'Bearer',
  expiresIn: 900,
  admin: {
    id: admin.id,
    name: admin.name,
    email: admin.email,
  },
};
  }
}