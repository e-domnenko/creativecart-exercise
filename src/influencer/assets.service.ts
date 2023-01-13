import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BrandService } from 'src/brand/brand.service';
import { In, Repository } from 'typeorm';
import { Assets, AssetStatus } from './asset.entity';

export class InvalidBrandError extends Error {}

@Injectable()
export class AssetsService {
  constructor(
    private brandService: BrandService,
    @InjectRepository(Assets) private assetsRepository: Repository<Assets>,
  ) {}

  async getAssets(authorId: number) {
    const assets = await this.assetsRepository.findBy({
      author: { id: authorId },
    });

    return assets.map(({ internalFileName, ...asset }) => asset);
  }

  async registerAsset(authorId: number, file: Express.Multer.File) {
    const assetEntity = this.assetsRepository.create({
      fileName: file.originalname,
      internalFileName: file.filename,
      author: { id: authorId },
    });

    const { internalFileName, author, ...asset } =
      await this.assetsRepository.save(assetEntity);

    return asset;
  }

  async assignAssets(authorId: number, assetIds: number[], brandId: number) {
    const brand = await this.brandService.getBrand(brandId);
    if (!brand) {
      throw new InvalidBrandError();
    }

    const assetsToUpdate = await this.assetsRepository.find({
      where: {
        id: In(assetIds),
        author: { id: authorId },
      },
    });

    assetsToUpdate.forEach((asset) => {
      asset.assignedBrand = brand;
      asset.status = AssetStatus.PENDING;
    });

    await this.assetsRepository.save(assetsToUpdate);
    return assetsToUpdate.map(
      ({ internalFileName, author, ...asset }) => asset,
    );
  }
}
