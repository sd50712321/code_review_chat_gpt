import { Injectable } from '@nestjs/common';

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
}
