import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class FindUserPasswordDto {
  constructor(partial: Partial<FindUserPasswordDto>) {
    Object.assign(this, partial);
  }
  @ApiProperty({
    description: '유저 아이디',
    example: 'user1234',
  })
  @IsString()
  @MaxLength(200)
  user_id: string;

  @ApiProperty({
    description: '유저 이름',
    example: '김유저',
  })
  @IsString()
  @MaxLength(200)
  user_name: string;

 @ApiProperty({
    description: '유저 이메일',
    example: '',
  })
  @IsString()
  @MaxLength(200)
  user_email: string;  
}
