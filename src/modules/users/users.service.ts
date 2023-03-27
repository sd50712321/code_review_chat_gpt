import { Injectable, Logger } from '@nestjs/common';
import { Connection, DeleteResult } from 'typeorm';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  private logger = new Logger('AdminsService', {
    timestamp: true,
  });

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

  async 마지막커밋댓글3() {
    const test = 'a';
    const aireo = 'b';
    let b = 1;
    b = 3;
    return undefined;
  }

  async 마지막커밋댓글4() {
    const test = 'a';
    const aireo = 'b';
    let b = 1;
    b = 3;
    return undefined;
  }
}
