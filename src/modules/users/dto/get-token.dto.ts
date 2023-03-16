import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class GetTokenDto {
  constructor(partial: Partial<GetTokenDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    description: '토큰',
    // example: 'master',
    // required: false,
  })
  @IsString()
  token: string;
}
