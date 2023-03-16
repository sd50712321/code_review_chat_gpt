import { ApiProperty } from '@nestjs/swagger';

export class JwtPayload {
  @ApiProperty({
    description: '유저 인덱스',
  })
  user_idx: number;

  @ApiProperty({
    description: '유저 아이디',
  })
  user_id: string;
}
