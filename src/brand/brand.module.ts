import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brands } from './brand.entity';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { Assets } from 'src/influencer/asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brands, Assets])],
  providers: [BrandService],
  exports: [BrandService],
  controllers: [BrandController],
})
export class BrandModule {}
