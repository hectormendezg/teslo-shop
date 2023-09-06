import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('products/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName')
    imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);
    //return path;
    /* res.status(403).json({
      ok: false,
      path: path,
    }); */
    res.sendFile(path);
  }
  @Post('products')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      limits: { fieldSize: 2000 },
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    //return file;
    if (!file) {
      throw new BadRequestException('Make sure that file is image');
    }

    //console.log(file);
    //const secureUrl = `${file.filename}`;
    const secureUrl = `${this.configService.get('HOST_API')}/files/products/${
      file.filename
    } `;

    return {
      //fileName: file.originalname,
      secureUrl,
    };
  }
}
