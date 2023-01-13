import { FileValidator } from '@nestjs/common';

export type AssetFilesValidatorOptions = {
  fileExtension?: string | RegExp;
  maxSize?: number;
};

export class AssetFilesValidator extends FileValidator<AssetFilesValidatorOptions> {
  buildErrorMessage(): string {
    return `Validation failed (expected type is ${this.validationOptions.fileExtension}`;
  }

  isValid(files: any[]): boolean | Promise<boolean> {
    if (!this.validationOptions) {
      return true;
    }

    const { fileExtension, maxSize } = this.validationOptions;
    if (!fileExtension && !maxSize) {
      return true;
    }

    return files.every((file) => {
      const fileNameParts = file.originalname.split('.');
      const extension = fileNameParts[fileNameParts.length - 1];

      return (
        (!fileExtension ||
          (extension as string).match(this.validationOptions.fileExtension)) &&
        (!maxSize || file.size <= maxSize)
      );
    });
  }
}
