import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly roles: string[];

  constructor(roles?: string | string[]) {
    super();

    if (roles) {
      this.roles = Array.isArray(roles) ? roles : [roles];
    }
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    const resolvedUser = super.handleRequest(err, user, info, context, status);

    if (this.roles && !this.roles.includes(resolvedUser.role)) {
      throw new ForbiddenException();
    }

    return resolvedUser;
  }
}
