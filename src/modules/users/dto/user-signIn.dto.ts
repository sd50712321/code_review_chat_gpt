import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UserSignInDto {
  @ApiProperty({
    description: '유저 아이디',
    required: true,
    example: 'user1234',
  })
  @IsString()
  user_id: string;

  @ApiProperty({
    description: '유저 비밀번호',
    required: false,
    example: '!a123456',
  })
  @IsString()
  user_pwd: string;

  @ApiProperty({
    description: '회원가입 타입 general / kakao / naver / google',
    example: 'general',
    required: false,
  })
  @IsEnum(['general', 'kakao', 'naver', 'google'])
  login_type: string;
      
}
