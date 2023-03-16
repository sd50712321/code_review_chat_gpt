import {
  Body,
  ConflictException,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { CommonResponse } from 'src/common/common.response';
import { UserAuthGuard } from 'src/utils/jwt/user/guards/user-auth.guard';
import { UserJwtPayload } from 'src/utils/jwt/user/user-jwt-payload.interface';
import { sendEmail } from 'src/utils/sendEmail';
import { AuthSignInResultResponse } from '../auth/response/auth-signIn.response';
import { PhoneNumCheckDto } from './dto/phone-num-check.dto';
import { GetTokenDto } from './dto/get-token.dto';
import { ChangeUserPwdDto } from './dto/change-user-pwd';
import { FindUserPasswordDto } from './dto/find-user-password.dto';
import { FindUserDto } from './dto/find-user.dto';
import { GetDuplicateCheckDto } from './dto/get-duplicate-check.dto';
import { UserSignInDto } from './dto/user-signIn.dto';
import { Users } from './users.entity';
import { UsersService } from './users.service';
import * as security from '../../utils/security';
import * as sms from '../../utils/sms';
import axios from 'axios';
import { Pagination } from 'src/utils/pagination';
@Controller('users')
@ApiTags('회원')
@UseGuards(UserAuthGuard)
export class UsersController {
  private logger = new Logger('UsersController', {
    timestamp: true,
  });
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('')
  @Public()
  @ApiOperation({ summary: 'id LIke 조회' })
  @ApiOkResponse({ type: CommonResponse })
  async getUserList(
    @Query() getFilterUserDto?: GetFilterUserDto,
  ): Promise<object> {
    const { user_id, users_idx, srch_cnt, page } = getFilterUserDto;
    const filterUser = new Users({
      user_id: user_id,
      users_idx: users_idx,
    });
    const userResult = await this.usersService.getList(getFilterUserDto);
    const total = await this.usersService.getTotal();
    // const userResult = await this.usersXGroupsService.getList()
    // console.log('adminResult : ', adminResult);
    // if (userResult && userResult.length > 0) {
    //   throw new ConflictException('User already exists');
    // }
    const pagination = new Pagination(total, page, srch_cnt).getPagenation();
    return {
      data: userResult,
      pagination,
    };
  }

  @Public()
  @Get('token-chk')
  @ApiOperation({ summary: 'token 확인' })
  async tokenCheck(@Query() gettokenDto?: GetTokenDto): Promise<object> {
    const { token } = gettokenDto;
    const tokenResult = await this.usersAuthenticationsService.verifyToken(
      token,
    );
    return tokenResult;
  }

  @Public()
  @Get('duplicate-check')
  @ApiOperation({ summary: 'Id duplicate check : true면 중복' })
  async idDuplicationCheck(
    @Query() getDuplicateCheckDto?: GetDuplicateCheckDto,
  ): Promise<object> {
    const { user_id } = getDuplicateCheckDto;
    const userResult = await this.usersService.findOne(user_id);
    // console.log('userResult : ', userResult);
    let result = false;
    if (userResult) {
      // throw new ConflictException('User already exists');
      result = true;
    }

    return {
      isExist: result,
    };
  }

  @Public()
  @Post()
  @ApiOperation({
    summary: '회원 등록 / 성별과 생년월일은 입력 안해도 됩니다.',
  })
  async insertUser(@Body() insertUserDto: InsertUserDto): Promise<Users> {
    const { user_id, group_code } = insertUserDto;
    const filterUser = new Users({
      user_id: user_id,
    });
    const userResult = await this.usersService.duplicatedIdCheck(filterUser);
    // console.log('userResult : ', userResult);
    if (userResult && userResult.length > 0) {
      throw new ConflictException('User already exists');
    }

    const groupFilter = new GetFilterGroupDto({
      group_code: group_code,
    });
    const group = await this.groupsService.getList(groupFilter);
    if (group && group.length < 1) {
      throw new NotFoundException('group not found');
    }

    const accessToken = await this.usersAuthenticationsService.signup(
      insertUserDto,
    );
    const user = await this.usersService.findOne(user_id);
    await this.usersXGroupsService.insertUsersXGroups(user, group[0]);
    // return {
    //   accessToken,
    // };
    return userResult[0];
  }

  @Public()
  @Post('sms')
  @ApiOperation({
    summary: '휴대폰번호를 인증합니다.',
  })
  async sendSms(
    @Request() req,
    @Body() phoneNumCheckDto: PhoneNumCheckDto,
  ): Promise<any> {
    const { user_phone } = phoneNumCheckDto;

    const receiver = user_phone.replace('+82', '0');
    // console.log('receiver : ',receiver)
    let firstNum = Math.ceil(Math.random() * 10);
    if (firstNum > 9) firstNum -= 1;

    const min = Math.ceil(100);
    const max = Math.floor(10000);
    const rest = Math.ceil(Math.random() * (max - min) + min);

    const authNum = String(firstNum) + String(rest);

    const alligoOption = {
      receiver,
      template: 'phone_num_auth',
      authNum,
    };

    const snsResult = await sms.sendAligo(alligoOption, req);
    return snsResult;
  }

  @Post('/signin')
  @Public()
  @ApiOperation({
    summary: '로그인합니다',
    description: 'accesstoken을 반환합니다',
  })
  @ApiOkResponse({ type: AuthSignInResultResponse })
  async signIn(@Body() userSignInDto: UserSignInDto): Promise<object> {
    const { user_id, user_pwd, login_type } = userSignInDto;
    // 로그인 정보 확인
    const getFilterUserDto = new GetFilterUserDto({
      user_id: user_id,
    });
    const userAuthResult = await this.usersAuthenticationsService.getList(
      getFilterUserDto,
    );
    if (userAuthResult && userAuthResult.length < 1) {
      throw new NotFoundException('User not found');
    }
    console.log('userAuthResult[0]', userAuthResult[0]);
    let accessToken;
    if (login_type === 'general') {
      accessToken = await this.usersAuthenticationsService.signIn(
        user_pwd,
        userAuthResult[0],
      );
    } else {
      accessToken = await this.usersAuthenticationsService.signIn(
        user_id,
        userAuthResult[0],
      );
    }
    const userResult = await this.usersService.findOne(user_id);
    userResult.last_login_dt = new Date();
    const updateResult = await this.usersService.updateUserLoginDate(
      userResult,
    );
    return {
      userResult,
      token: accessToken,
    };
  }

  @Public()
  @Post('/findId')
  @ApiOperation({ summary: '아이디 찾기' })
  async findId(@Body() findUserDto: FindUserDto): Promise<object> {
    const { user_email, user_name } = findUserDto;
    const filterUser = new GetFilterUserDto({
      user_name: user_name,
      user_email: user_email,
    });
    // console.log('filterUser : ', filterUser)
    const result = await this.usersService.getList(filterUser);
    if (result && result.length < 1) {
      throw new NotFoundException('User not found');
    }
    return result;
  }

  @Public()
  @Post('/findPassword')
  @ApiOperation({ summary: '비밀번호 찾기' })
  async findPassword(
    @Body() findUserPasswordDto: FindUserPasswordDto,
  ): Promise<object> {
    const { user_id, user_name, user_email } = findUserPasswordDto;
    const filterUser = new GetFilterUserDto({
      user_id: user_id,
      user_name: user_name,
      user_email: user_email,
    });
    const result = await this.usersService.getList(filterUser);
    if (result && result.length < 1) {
      throw new NotFoundException('User not found');
    }
    const userResult = result[0];
    //access token을 재발행하여 링크 발송
    const payload: UserJwtPayload = {
      users_idx: userResult.users_idx,
      user_id: userResult.user_id,
      login_type: 'user',
    };
    const accessToken: string =
      await this.usersAuthenticationsService.getAccessToken(payload);
    // console.log('accessToken : ',accessToken)

    const emailResult = await sendEmail(userResult.user_email, url);

    // console.log('emailResult : ', emailResult);
    return {
      userResult,
      url: url,
    };
  }

  @ApiBearerAuth()
  @Patch('')
  @ApiOperation({ summary: '유저 비밀번호 수정' })
  async UpdateUserPassword(
    @Body() changeUserPwdDto: ChangeUserPwdDto,
    @Request() req,
  ): Promise<Users> {
    const { users_idx } = req.user;
    const { user_id, user_pwd } = changeUserPwdDto;

    const bearer = req.headers.authorization.split(' ')[0];
    if (bearer !== 'Bearer') throw new NotFoundException(`Invalid bearer`);

    const token = req.headers.authorization.split(' ')[1];
    if (!token) throw { status: 400, errorMessage: 'Invalid token type' };

    const decodeToken: object =
      await this.usersAuthenticationsService.decodeToken(token);
    if (decodeToken['user_id'] !== user_id)
      throw new NotFoundException(`User ID is not matched`);

    const filterUser = new GetFilterUserDto({
      users_idx: users_idx,
    });
    const userResult = await this.usersService.getList(filterUser);
    // console.log('adminAuthorities', adminAuthorities);
    if (userResult.length < 1) {
      throw new NotFoundException(`User not found`);
    }

    const getFilterUserDto = new GetFilterUserDto({
      users_idx: userResult[0].users_idx,
    });
    const userAuthResult = await this.usersAuthenticationsService.getList(
      getFilterUserDto,
    );
    userAuthResult[0].user_pwd = user_pwd;

    const updateResult = await this.usersAuthenticationsService.updateUserAuth(
      userAuthResult[0],
    );
    // admin_authorities_x_categories 삭제 후 삽입
    // const result = await this.adminsAuthoritiesService.updateAdminAuthority(
    //   admin_authorities_idx,
    //   postAdminAuthoritiesDto,
    // );
    return userResult[0];
  }

  @ApiBearerAuth()
  @Patch('/userUpdate')
  @ApiOperation({
    summary: '유저 수정',
    description: 'user_classify : normal / group / groupmanager ',
  })
  async UpdateAdminAuthorty(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ): Promise<Users> {
    const { users_idx } = req.user;
    let {
      user_address,
      user_address_detail,
      user_birth,
      user_classify,
      user_gender,
      user_name,
      user_phone,
      user_pwd,
    } = updateUserDto;

    // admin_authorities 수정
    // this.logger.log(req)
    const userFilter = new GetFilterUserDto({ users_idx });
    const userResult = await this.usersService.getList(userFilter);
    if (userResult.length < 1) {
      throw new NotFoundException(`User not found`);
    }

    const newUser = userResult[0];

    const updateResult = await this.usersService.updateUser(
      newUser,
      updateUserDto,
    );
    const newUserAuth = await this.usersAuthenticationsService.getList(
      userFilter,
    );

    if (user_pwd) {
      user_pwd = user_pwd.replace(/(\s*)/g, '');
      if (user_pwd !== '') {
        newUserAuth[0].user_pwd = user_pwd;
        await this.usersAuthenticationsService.updateUserAuth(newUserAuth[0]);
      }
    }

    return updateResult;
  }

  @Delete('/:users_idx')
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 탈퇴' })
  delete(@Param('users_idx') users_idx: number): Promise<DeleteResult> {
    // console.log('users_idx delete called');
    return this.usersService.delete(users_idx);
  }
}
