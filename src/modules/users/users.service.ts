import { Injectable, Logger } from '@nestjs/common';
import { Connection, DeleteResult } from 'typeorm';
import { GetFilterUserDto } from '../users-in-admin/dto/get-filter-user.dto';
import { GetDuplicateCheckDto } from './dto/get-duplicate-check.dto';
import { InsertUserDto } from '../users-in-admin/dto/insert-user.dto';
import { MultiDeleteUsersDto } from '../users-in-admin/dto/multi-delete-user';
import { UpdateUserDto } from '../users-in-admin/dto/update-user.dto';
import { Users } from './users.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  private logger = new Logger('AdminsService', {
    timestamp: true,
  });

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly connection: Connection,
  ) {}

  async insertUser(insertUserDto: InsertUserDto): Promise<Users> {
    // const { counselor_schedules } = insertCounselorDto;
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const result = await this.usersRepository.insertUser(
        insertUserDto,
        queryRunner.manager,
      );
      return result;
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getList(filterUser?: GetFilterUserDto | Users): Promise<Users[]> {
    const result = await this.usersRepository.getList(filterUser);
    return result;
  }

  async duplicatedIdCheck(filterUser?: GetDuplicateCheckDto): Promise<Users[]> {
    const result = await this.usersRepository.duplicatedIdCheck(filterUser);
    return result;
  }

  async getTotal(): Promise<number> {
    const result = await this.usersRepository.count();
    return result;
  }

  async findOne(user_id: string): Promise<Users> {
    const result = await this.usersRepository.findOne({
      where: { user_id },
    });
    return result;
  }

  async updateUser(user: Users, updateUserDto: UpdateUserDto): Promise<Users> {
    const {
      user_address,
      user_address_detail,
      user_birth,
      user_classify,
      user_gender,
      user_name,
      user_phone,
      user_pwd,
    } = updateUserDto;

    // user.user_address = user_address ? user_address : user.user_address
    // user.user_address_detail = user_address_detail ? user_address_detail : user.user_address_detail
    // user.user_birth = user_birth ? user_birth : user.user_birth
    // user.user_classify = user_classify ? user_classify : user.user_classify
    // user.user_gender = user_gender ? user_gender : user.user_gender
    // user.user_name = user_name ? user_name : user.user_name
    // user.user_phone = user_phone ? user_phone : user.user_phone

    const keys = Object.keys(updateUserDto);
    for (let i = 0; i < keys.length; i++) {
      user[keys[i]] = updateUserDto[keys[i]];
    }

    return await this.usersRepository.save(user);
  }

  async updateUserLoginDate(user: Users): Promise<Users> {
    return await this.usersRepository.save(user);
  }

  async delete(users_idx: number): Promise<DeleteResult> {
    // delete admin authority
    const result = await this.usersRepository.delete({ users_idx });

    // delete admin authority x categories
    return result;
  }

  async multipleDelete(
    multiDeleteUsersDto: MultiDeleteUsersDto,
  ): Promise<DeleteResult> {
    // console.log('multipleDelete multiDeleteAdminAuthoritiesDto : ',multiDeleteAdminAuthoritiesDto)
    // delete admin authority

    const { users_idx_array } = multiDeleteUsersDto;
    return await this.usersRepository.multipleDelete(users_idx_array);
  }

  async 마지막커밋댓글() {
    const test = 'a';
    let b = 1;
    b = 3;
    return undefined;
  }

  async 마지막커밋댓글2() {
    const test = 'a';
    let b = 1;
    b = 3;
    return undefined;
  }
}
