import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { Assets, AssetStatus } from 'src/influencer/asset.entity';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Brands } from './brand.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const JSZip = require('jszip');

export class IncorrectAssetStatusError extends Error {}

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brands) private brandRepository: Repository<Brands>,
    @InjectRepository(Assets) private assetsRepository: Repository<Assets>,
  ) {}

  private cleanAsset(assetRaw: Assets) {
    const {
      internalFileName,
      author: { password, ...author },
      ...asset
    } = assetRaw;

    return { ...asset, author };
  }

  async getBrand(brandId: number) {
    return await this.brandRepository.findOne({ where: { id: brandId } });
  }

  async getBrandForUser(userId: number) {
    return await this.brandRepository.findOne({
      where: { managers: { id: userId } },
    });
  }

  private async findBrandAssets(
    brandId: number,
    where?: FindOptionsWhere<Assets>,
  ) {
    return await this.assetsRepository.find({
      where: { ...where, assignedBrand: { id: brandId } },
      relations: ['author'],
    });
  }

  async getBrandAssets(brandId: number) {
    const assets = await this.findBrandAssets(brandId);
    return assets.map(this.cleanAsset);
  }

  async changeAssetStatus(
    brandId: number,
    assetId: number,
    status: AssetStatus,
  ) {
    const [assetToUpdate] = await this.findBrandAssets(brandId, {
      id: assetId,
    });

    if (!assetToUpdate) return null;

    if (assetToUpdate.status !== AssetStatus.PENDING) {
      throw new IncorrectAssetStatusError();
    }

    assetToUpdate.status = status;
    await this.assetsRepository.save(assetToUpdate);

    return this.cleanAsset(assetToUpdate);
  }

  private createUniqName(addedFiles: Map<string, number>, currentName: string) {
    if (!addedFiles.has(currentName)) {
      addedFiles.set(currentName, 0);
      return currentName;
    }

    const index = addedFiles.get(currentName) + 1;
    const { name, ext } = path.parse(currentName);
    addedFiles.set(currentName, index);
    return this.createUniqName(addedFiles, `${name} (${index})${ext}`);
  }

  async createAssetsZip(brandId: number, assetIds: number[]) {
    const assets = await this.findBrandAssets(brandId, { id: In(assetIds) });

    if (assets.length === 0) return null;

    const addedFiles = new Map();
    const assetsZip = new JSZip();
    const assetsDir = path.join(process.cwd(), 'assets');

    for (const asset of assets) {
      const uploadFile = path.join(assetsDir, asset.internalFileName);
      const uploadContent = await readFile(uploadFile);
      assetsZip.file(
        this.createUniqName(addedFiles, asset.fileName),
        uploadContent,
      );

      console.log(assetsZip.length);
    }

    return assetsZip.generateNodeStream();
  }
}
