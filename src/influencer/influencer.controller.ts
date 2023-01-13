import {
  Controller,
  Get,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AssetsService, InvalidBrandError } from './assets.service';
import { AssetFilesValidator } from './asset-files.validator';
import { InfluencerAuthGuard } from './influencer-auth.guard';

@Controller('api/v1/influencer')
export class InfluencerController {
  constructor(private assetsService: AssetsService) {}

  @Get('assets')
  @UseGuards(InfluencerAuthGuard)
  async assets(@Request() req) {
    return await this.assetsService.getAssets(req.user.userId);
  }

  @Post('assets/assign')
  @UseGuards(InfluencerAuthGuard)
  async assignAsset(@Request() req) {
    const { assetIds, brandId } = req.body;

    if (!Array.isArray(assetIds) || assetIds.length === 0 || !brandId) {
      throw new BadRequestException();
    }

    try {
      return await this.assetsService.assignAssets(
        req.user.userId,
        assetIds,
        brandId,
      );
    } catch (err) {
      if (err instanceof InvalidBrandError) {
        throw new BadRequestException();
      }

      throw err;
    }
  }

  @Post('upload')
  @UseGuards(InfluencerAuthGuard)
  @UseInterceptors(FilesInterceptor('file'))
  async upload(
    @Request() req,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new AssetFilesValidator({
            fileExtension: /pdf|png|mp4/,
            maxSize: 100 * 1024 * 1024,
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    return await Promise.all(
      files.map((file) =>
        this.assetsService.registerAsset(req.user.userId, file),
      ),
    );
  }
}
