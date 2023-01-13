import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  Response,
  StreamableFile,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { AssetStatus } from 'src/influencer/asset.entity';
import { Readable } from 'stream';
import { BrandAuthGuard } from './brand-auth.guard';
import { BrandService, IncorrectAssetStatusError } from './brand.service';

@Controller('api/v1/brand')
export class BrandController {
  constructor(private brandService: BrandService) {}

  private async validateUserBrand(userId: number) {
    const brand = await this.brandService.getBrandForUser(userId);
    if (!brand) {
      throw new ForbiddenException();
    }

    return brand;
  }

  @Get('assets')
  @UseGuards(BrandAuthGuard)
  async assets(@Request() req) {
    const brand = await this.validateUserBrand(req.user.userId);
    return this.brandService.getBrandAssets(brand.id);
  }

  @Post('assets/:assetId/status')
  @UseGuards(BrandAuthGuard)
  async assetsStatus(
    @Param('assetId', new ParseIntPipe()) assetId,
    @Request() req,
  ) {
    const { status } = req.body;
    const allowedStatus = [AssetStatus.APPROVED, AssetStatus.REJECTED];

    if (!status || !allowedStatus.includes(status)) {
      throw new BadRequestException();
    }

    const brand = await this.validateUserBrand(req.user.userId);

    try {
      const asset = await this.brandService.changeAssetStatus(
        brand.id,
        assetId,
        status as AssetStatus,
      );

      if (!asset) {
        throw new NotFoundException();
      }

      return asset;
    } catch (err) {
      if (err instanceof IncorrectAssetStatusError) {
        throw new UnprocessableEntityException();
      }

      throw err;
    }
  }

  @Get('assets.zip')
  @UseGuards(BrandAuthGuard)
  async download(
    @Query('id') queryIds: string | string[],
    @Request() req,
    @Response({ passthrough: true }) res,
  ) {
    const assetIds = (Array.isArray(queryIds) ? queryIds : [queryIds])
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));

    if (
      assetIds.length === 0 ||
      (Array.isArray(queryIds) && queryIds.length > assetIds.length)
    ) {
      throw new BadRequestException();
    }

    const brand = await this.validateUserBrand(req.user.userId);

    const zipStream = await this.brandService.createAssetsZip(
      brand.id,
      assetIds,
    );

    if (!zipStream) {
      throw new NotFoundException();
    }

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=assets.zip',
    });

    return new StreamableFile(zipStream as Readable);
  }
}
