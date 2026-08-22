import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class CanRegisterGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtAuthGuard: JwtAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (await this.usersService.hasAny()) {
      return await this.jwtAuthGuard.canActivate(context);
    }

    return true;
  }
}
