import * as path from 'path';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { InfluencerController } from './influencer.controller';
import { AssetsService } from './assets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assets } from './asset.entity';
import { BrandModule } from 'src/brand/brand.module';

@Module({
  imports: [
    BrandModule,
    MulterModule.register({ dest: path.join(process.cwd(), 'assets') }),
    TypeOrmModule.forFeature([Assets]),
  ],
  controllers: [InfluencerController],
  providers: [AssetsService],
})
export class InfluencerModule {}
