import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Users {
  constructor(partial: Partial<Users>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('increment', {
    comment: '인덱스',
    unsigned: true,
    type: 'bigint',
  })
  @ApiProperty({
    description: '인덱스',
  })
  users_idx: number;

  @Column({
    comment: '유저 아이디',
    type: 'varchar',
    length: 100,
  })
  @ApiProperty({
    description: '유저 아이디',
  })
  user_id: string;

  @Column({
    comment: '유저 이름',
    type: 'varchar',
    length: 100,
  })
  @ApiProperty({
    description: '유저 이름',
  })
  user_name: string;

  @Column({
    comment: '유저 이메일',
    type: 'varchar',
    length: 255,
  })
  @ApiProperty({
    description: '유저 이메일',
  })
  user_email: string;

  @Column({
    comment: '유저 휴대폰번호',
    type: 'varchar',
    length: 13,
  })
  @ApiProperty({
    description: '유저 휴대폰번호',
  })
  user_phone: string;

  @Column({
    comment: '유저 생일월일',
    type: 'varchar',
    length: 10,
  })
  @ApiProperty({
    description: '유저 생일월일',
  })
  user_birth: string;

  @Column({
    comment: '유저 성별',
    type: 'enum',
    default: 'none',
    enum: ['man', 'woman', 'none'],
  })
  @ApiProperty({
    description: '유저 성별',
  })
  user_gender: string;

  @Column({
    comment: '유저 주소',
    type: 'varchar',
    length: 100,
  })
  @ApiProperty({
    description: '유저 주소',
  })
  user_address: string;

  @Column({
    comment: '유저 주소 상세',
    type: 'varchar',
    length: 100,
  })
  @ApiProperty({
    description: '유저 주소 상세',
  })
  user_address_detail: string;

  @Column({
    comment: '특별시, 도',
    type: 'varchar',
    length: 200,
  })
  @ApiProperty({
    description: '특별시, 도',
    type: 'string',
  })
  @IsString()
  province: string;

  @Column({
    comment: '구군리',
    type: 'varchar',
    length: 200,
  })
  @ApiProperty({
    description: '구군리',
    type: 'string',
  })
  @IsString()
  city: string;
  

  @Column({
    comment: '회원분류',
    type: 'enum',
    enum: ['normal', 'group', 'groupmanager'],
  })
  @ApiProperty({
    description: '회원분류',
    type: 'enum',
    enum: ['normal', 'group'],
  })
  user_classify: string;

  @Column({
    comment: 'sms, email 수신 동의 여부 (필수)',
    type: 'enum',
    enum: ['y', 'n'],
  })
  @ApiProperty({
    description: 'sms, email 수신 동의 여부 (필수)',
    type: 'enum',
    enum: ['y', 'n'],
  })
  sms_reception_required_or_not: string;

  @Column({
    comment: 'sms, email 수신 동의 여부 (이벤트)',
    type: 'enum',
    enum: ['y', 'n'],
  })
  @ApiProperty({
    description: 'sms, email 수신 동의 여부 (이벤트)',
    type: 'enum',
    enum: ['y', 'n'],
  })
  sms_reception_event_or_not: string;

  @Column({
    comment: '삭제여부',
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  @ApiProperty({
    description: '삭제여부',
    type: 'enum',
    enum: ['y', 'n'],
    default: 'n',
  })
  user_delete_or_not: string;

  @Column({
    comment: '로그인 타입',
    type: 'enum',
    enum: ['general', 'kakao', 'naver', 'google'],
    default: 'general',
  })
  @ApiProperty({
    description: '로그인 타입',
    type: 'enum',
    enum: ['general', 'kakao', 'naver', 'google'],
  })
  login_type: string;

  @Column({
    comment: '최초 생성 일자',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({
    description: '최초 생성 일자',
  })
  first_create_dt: Date;

  @Column({
    comment: '마지막 수정 일자',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({
    description: '마지막 수정 일자',
  })
  last_update_dt: Date;

  @Column({
    comment: '마지막 로그인 일자',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({
    description: '마지막 로그인 일자',
  })
  last_login_dt: Date;

  /**
  //  * @type {UsersAuthentications}
  //  * @memberof Users
  //  * @description users-authentications(유저인증 테이블)과 1:1 관계
  //  */
  // @OneToOne(
  //   (_type) => UsersAuthentications,
  //   (users_authentications) => users_authentications.users,
  // )
  // @JoinColumn({
  //   name: 'users_idx',
  // })
  // @Exclude({ toPlainOnly: true })
  // users_authentications: UsersAuthentications;

  /**
   * @type {UsersGroups}
   * @memberof Users
   * @description users-x-groups(유저그룹 join 테이블)와 1:n 관계
   */
  // @Exclude({ toPlainOnly: true })
  @OneToOne((_type) => UsersXGroups, (users_x_groups) => users_x_groups.users)
  users_x_groups: UsersXGroups;

  /**
   * @type {ReservationsXUsers}
   * @memberof Users
   * @description reservations_x_users(예약유저 join 테이블)와 1:n 관계
   */
  @OneToMany(
    (_type) => ReservationsXUsers,
    (reservations_x_users) => reservations_x_users.users,
  )
  reservations_x_users: ReservationsXUsers[];

  /**
  //  * @type {OneOnOneQuestion}
  //  * @memberof OneOnOneQuestion
  //  * @description one-on-one-question(1:1문의사항 join 테이블)와 1:n 관계
  //  */
  // @OneToMany(
  //   (_type) => OneOnOneQuestions,
  //   (one_on_one_questions) => one_on_one_questions.users,
  // )
  // one_on_one_question: OneOnOneQuestions[];
}
