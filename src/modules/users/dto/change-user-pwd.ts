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

export class ChangeUserPwdDto {
  constructor(partial: Partial<ChangeUserPwdDto>) {
    Object.assign(this, partial);
  }
  @ApiProperty({
    description: '유저 아이디',
    required: true,
    example: 'user1234',
  })
  @IsString()
  user_id: string;

  @ApiProperty({
    description: '유저 비밀번호',
    required: true,
    example: '!a123456',
  })
  @IsString()
  user_pwd: string;
}
