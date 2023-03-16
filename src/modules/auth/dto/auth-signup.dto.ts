import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthSignUpDto {
  @ApiProperty({
    description: '유저 아이디',
    required: true,
    example: 'sd50712321',
  })
  @IsString()
  @MaxLength(50)
  @MinLength(4)
  user_id: string;

  @ApiProperty({
    description: '유저 비밀번호',
    required: true,
    example: 'R!a12345',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        '8글자, 적어도 1개의 대문자, 적어도 1개의 소문자, 적어도 1개의 숫자, 적어도 1개의 특수문자가 필요합니다.',
    },
  )
  user_pwd: string;

  @ApiProperty({
    description: '유저 이름',
    required: true,
    example: '이상민',
  })
  @IsString()
  @MaxLength(20)
  user_name: string;

  @ApiProperty({
    description: '유저 전화번호',
    required: true,
    example: '010-5040-5445',
  })
  @IsString()
  @MinLength(10)
  @Matches(/^0\d{1,2}-\d{3,4}-\d{4}$/, {
    message: '전화번호는 0으로 시작하고 -를 포함합니다.',
  })
  user_phone: string;
}
