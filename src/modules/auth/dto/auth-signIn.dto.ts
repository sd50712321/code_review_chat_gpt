import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthSignInDto {
  @ApiProperty({
    description: '유저 아이디',
    required: true,
    example: 'sd50712321',
  })
  @IsString()
  user_id: string;

  @ApiProperty({
    description: '유저 비밀번호',
    required: true,
    example: 'R!a12345',
  })
  @IsString()
  user_pwd: string;
}
