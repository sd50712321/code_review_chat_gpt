import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { UsersModule } from 'src/modules/users/users.module';
import { UsersController } from 'src/modules/users/users.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/utils/jwt/admin/guards/jwt-auth.guard';

@Module({
  imports: [
    // 캐시 사용하기 위한 모듈
    // CacheModule.registerAsync({}),
    // CacheModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     store: redisStore,
    //     host: config.get('NODE_ENV') !== 'local' ? 'redis' : 'localhost',
    //     port: 6379,
    //     ttl: 60 * 30, // 30 minute
    //     max: 30,
    //   }),
    // }),
    UsersModule,
  ],
  controllers: [
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AdminApiModule {}
