import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { User } from '../../entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    this.logger.log(`Authentication succeeded email=${user.email}`);

    return this.buildTokenResponse(user);
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        dto.refreshToken,
        {
          secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        },
      );

      const user = await this.usersService.findOne(payload.sub);
      this.logger.log(`Refresh token accepted userId=${user.id}`);

      return this.buildTokenResponse(user);
    } catch {
      this.logger.warn('Refresh token rejected');
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateJwtPayload(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findOne(payload.sub);

    if (!user.isActive) {
      this.logger.warn(`JWT rejected inactiveUserId=${user.id}`);
      throw new UnauthorizedException('User is inactive');
    }

    this.logger.log(`JWT accepted userId=${user.id}`);

    return this.toAuthenticatedUser(user);
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isActive) {
      this.logger.warn(`Authentication failed email=${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      this.logger.warn(`Authentication failed email=${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private buildTokenResponse(user: User) {
    const payload = this.toPayload(user);

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow<string>('jwt.secret'),
        expiresIn: this.configService.getOrThrow<string>(
          'jwt.accessExpiresIn',
        ) as JwtSignOptions['expiresIn'],
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: this.configService.getOrThrow<string>(
          'jwt.refreshExpiresIn',
        ) as JwtSignOptions['expiresIn'],
      }),
      user: this.toAuthenticatedUser(user),
    };
  }

  private toPayload(user: User): JwtPayload {
    const roles = user.roles?.map((role) => role.name) ?? [];
    const permissions =
      user.roles?.flatMap(
        (role) => role.permissions?.map((permission) => permission.name) ?? [],
      ) ?? [];

    return {
      sub: user.id,
      email: user.email,
      roles,
      permissions: [...new Set(permissions)],
    };
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    const payload = this.toPayload(user);

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}
