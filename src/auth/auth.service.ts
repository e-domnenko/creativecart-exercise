import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole, Users } from './user.entity';
import { Brands } from 'src/brand/brand.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Users) private userRepository: Repository<Users>,
    @InjectRepository(Brands) private brandRepository: Repository<Brands>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const brandsResult = await this.brandRepository
      .createQueryBuilder()
      .insert()
      .values([
        {
          id: null,
          name: 'Fly Dubai',
        },
        {
          id: null,
          name: 'Lufthansa',
        },
      ])
      .orIgnore()
      .execute();

    await this.userRepository
      .createQueryBuilder()
      .insert()
      .values([
        {
          id: null,
          email: 'influencer1@mail.com',
          password: bcrypt.hashSync('password', bcrypt.genSaltSync()),
        },
        {
          id: null,
          email: 'manager1@flydubai.com',
          password: bcrypt.hashSync('password', bcrypt.genSaltSync()),
          role: UserRole.BRAND_MANAGER,
          brand: brandsResult.identifiers[0],
        },
        {
          id: null,
          email: 'manager1@lufthansa.com',
          password: bcrypt.hashSync('password', bcrypt.genSaltSync()),
          role: UserRole.BRAND_MANAGER,
          brand: brandsResult.identifiers[1],
        },
      ])
      .orIgnore()
      .execute();

    new Logger(AuthService.name).log('Fixtures loaded successfully');
  }

  async validateUser(email: string, password: string): Promise<any> {
    const foundUser = await this.userRepository.findOneBy({ email });

    if (foundUser && bcrypt.compare(foundUser.password, password)) {
      const { password, ...user } = foundUser;
      return user;
    }

    return null;
  }

  async login(user: any): Promise<any> {
    const payload = { username: user.username, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async checkUserExists(userId: number) {
    return this.userRepository.exist({ where: { id: userId } });
  }
}
