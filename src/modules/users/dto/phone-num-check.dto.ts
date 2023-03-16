import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PhoneNumCheckDto {
  constructor(partial: Partial<PhoneNumCheckDto>) {
    Object.assign(this, partial);
  }
  @ApiProperty({
    description: '유저 휴대폰번호',
    example: '010-6732-0224',
  })
  @IsString()
  @MaxLength(200)
  @Matches(/^0\d{1,2}-\d{3,4}-\d{4}$/, {
    message: '전화번호는 0으로 시작하고 -를 포함합니다.',
  })
  user_phone: string;
}
