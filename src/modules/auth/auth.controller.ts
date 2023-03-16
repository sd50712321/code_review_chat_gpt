import {
  Body,
  ConflictException,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { AuthSignInDto } from './dto/auth-signIn.dto';
import { AuthSignUpDto } from './dto/auth-signup.dto';
import { JwtPayload } from './dto/jwt-payload.interface';
import {
  AuthSignInResult,
  AuthSignInResultResponse,
} from './response/auth-signIn.response';

@Controller('/auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // @Post('/signin')
  // @ApiTags('인증')
  // @ApiOperation({
  //   summary: '로그인합니다',
  //   description: 'accesstoken을 반환합니다',
  // })
  // @ApiOkResponse({ type: AuthSignInResultResponse })
  // async signIn(
  //   @Body() authSignInDto: AuthSignInDto,
  // ): Promise<void> {
  //   const { user_id, user_pwd } = authSignInDto;

  //   // 로그인 정보 확인
  //   const userLoginInfo = await this.usersAuthService.getLoginInfo(user_id);
  //   if (!userLoginInfo) {
  //     throw new NotFoundException('User not found');
  //   }
  //   const { user_pwd: secret } = userLoginInfo;
  //   this.logger.log(`userLoginInfo ${JSON.stringify(userLoginInfo)}`);
  //   const compareResult = await comparePassword(
  //     user_pwd,
  //     this.configService.get('SALT'),
  //     secret,
  //   );
  //   if (!compareResult) {
  //     throw new UnauthorizedException('Invalid User');
  //   }

  //   if (userLoginInfo && compareResult) {
  //     const { user } = userLoginInfo;
  //     const { user_idx, user_id } = user;
  //     const payload: JwtPayload = {
  //       user_idx,
  //       user_id,
  //     };
  //     const accessToken: string = await this.jwtService.sign(payload);
  //     return {
  //       accessToken,
  //     };
  //   } else {
  //     throw new UnauthorizedException('Login failed');
  //   }
  // }

  // @Public()
  // @Post('/signup')
  // @ApiTags('인증')
  // @ApiOperation({
  //   summary: '회원가입합니다',
  //   description: '아이디 중복체크 포함',
  // })
  // @ApiOkResponse({ type: CommonResponseVoid })
  // async signup(@Body() authSignUpDto: AuthSignUpDto): Promise<void> {
  //   const { user_id } = authSignUpDto;

  //   const user = await this.usersService.getUserByUserId(user_id);
  //   if (user) {
  //     throw new ConflictException('User already exists');
  //   }

  //   await this.usersService.insertUser(authSignUpDto);
  // }
}
