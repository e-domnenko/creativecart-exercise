import { Injectable } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRole } from 'src/auth/user.entity';

@Injectable()
export class BrandAuthGuard extends JwtAuthGuard {
  constructor() {
    super(UserRole.BRAND_MANAGER);
  }
}
