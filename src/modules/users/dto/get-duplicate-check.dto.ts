import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class GetDuplicateCheckDto {
  constructor(partial: Partial<GetDuplicateCheckDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    description: '유저 아이디',
    // example: 'master',
    // required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  user_id: string;
}
