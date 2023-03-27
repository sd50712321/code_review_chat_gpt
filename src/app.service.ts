import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getHello2(): string {
    const 헬로네임 = 'hello';
    for (let i = 0; i < 3; i++) {
      console.log('i =', i);
    }
    return 'Hello World!';
  }
}
