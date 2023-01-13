import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { InfluencerModule } from './influencer/influencer.module';
import { BrandModule } from './brand/brand.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'creatorCartDB',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    InfluencerModule,
    BrandModule,
  ],
  exports: [TypeOrmModule],
})
export class AppModule {}
