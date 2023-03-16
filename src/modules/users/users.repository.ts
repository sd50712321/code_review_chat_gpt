import { Logger } from '@nestjs/common';
import {
  DeleteResult,
  EntityManager,
  EntityRepository,
  Repository,
} from 'typeorm';
import { GetDuplicateCheckDto } from './dto/get-duplicate-check.dto';
import { Users } from './users.entity';

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
  private logger = new Logger('UsersRepository', { timestamp: true });

  async multipleDelete(users_idx_array: number[]): Promise<DeleteResult> {
    const query = this.createQueryBuilder('users');
    query.where('users_idx IN (:...ids)', { ids: users_idx_array });
    const result = await query.delete().execute();
    return result;
  }

  //* 해당 단체에 소속한 유저 조회
  async findUsersByGroup(groups_idx: number): Promise<Users[]> {
    const query = this.createQueryBuilder('users');

    // 해당 단체와 연관된 유저-단체 테이블 조회
    query.leftJoin('users.users_x_groups', 'users_x_groups'); // 유저가 소속한 그룹 join
    query.leftJoin('users_x_groups.groups_new', 'groups_new'); // "
    query.andWhere('groups_new.groups_idx = :groups_idx', { groups_idx }); // 해당 인덱스의 단체에 소속된 유저만 조회

    // 유저 선택
    query.leftJoinAndSelect('users_x_groups.users', 'user');

    return await query.getMany();
  }
}
