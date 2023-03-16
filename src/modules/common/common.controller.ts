import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/utils/jwt/admin/guards/jwt-auth.guard';
import { GetPreSignedURLDto } from './dto/get-presigned-url.dto';
import * as environment from '../../environment';
import * as s3 from '../../utils/s3';
import { uuid } from 'uuidv4';

@Controller('common')
@ApiTags('일반')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CommonController {
  @Get()
  @ApiOperation({ summary: 'AWS S3 Presigned URL' })
  async getImageUrl(
    @Query() getPreSignedURLDto?: GetPreSignedURLDto,
  ): Promise<any> {
    const { type, mimetype, extension } = getPreSignedURLDto;
    // console.log('mimetype : ', mimetype)
    let path = ``;
    path = `${
      environment.NODE_ENV
    }/${type}/${uuid()}-${new Date().valueOf()}.${extension}`;
    const url = s3.generatePreSignedUrl({
      key: path,
      mimetype,
    });
    // url+=`&x-amz-meta-Cache-Control=must-revalidate`

    // console.log('cloi.jpg')
    // path = type === 'chat' ? `${config.aws.s3.frontPath}/${path}` : path
    return { url, path };
  }
}
