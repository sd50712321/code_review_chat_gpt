import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class GetPreSignedURLDto {
  constructor(partial: Partial<GetPreSignedURLDto>) {
    Object.assign(this, partial);
  } 


  @ApiProperty({
    description: '이미지 분류',
    example: 'goods',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['goods', 'notices'])
  type: string;

  @ApiProperty({
    description: 'mimetype',
    example: 'mimetype',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  mimetype: string;

  @ApiProperty({
    description: 'extension',
    example: 'extension',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  extension: string;

}
