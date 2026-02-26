import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    return {
      message: `${user.name} registered successfully`,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        role: user.role,
      },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);

    await this.usersService.update(user.id, { refreshToken: hashedRefresh });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException();
    }
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isMatch) {
      throw new UnauthorizedException();
    }
    const newAccessToken = this.jwtService.sign(
      {
        sub: user.id,
        role: user.role,
      },
      { expiresIn: '15m' },
    );
    const newRefreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );
    const hashedNewRefresh = await bcrypt.hash(newRefreshToken, 10);
    await this.usersService.update(user.id, { refreshToken: hashedNewRefresh });
    return { access_token: newAccessToken, refresh_token: newRefreshToken };
  }
}
