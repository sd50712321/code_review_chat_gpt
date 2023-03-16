import { ApiProperty } from '@nestjs/swagger';
import { CommonResponseSingleObject } from '../../../common/common.response';

export class AuthSignInResult {
  @ApiProperty({ description: '엑세스 토큰' })
  readonly accessToken: string;
}

export class AuthSignInResultResponse extends CommonResponseSingleObject<AuthSignInResult> {
  @ApiProperty({
    description: '결과 값',
    type: AuthSignInResult,
  })
  readonly data: AuthSignInResult;
}
