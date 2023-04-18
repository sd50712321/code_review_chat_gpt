import { Injectable } from '@nestjs/common';
import { Users } from './modules/users/users.entity';
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getHello2(): string {
    const 한글 = 'kor';
    for (let i = 0; i < 3; i++) {
      console.log('i = ', i);
    }
    return 'Hello World!';
  }
  async tryCatchTest(): Promise<Users> {
    const user = new Users({
      user_name: 'test',
    });
    try {
      await sleep(1000);
      return user;
    } catch (err) {
      console.error('err', err);
    }
  }
  async tryCatchTest2(): Promise<Users> {
    const user = new Users({
      user_name: 'test',
    });
    try {
      await sleep(1000);
      return user;
    } catch (err) {
      console.error('err', err);
    }
  }
}
