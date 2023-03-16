import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configValidationSchema } from './config.schema';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { AdminApiModule } from './controllers/admin-controller.module';
import { Modules } from './modules/modules';
import { UserApiModule } from './controllers/user-controller.module';
import { JwtAuthGuard } from './utils/jwt/admin/guards/jwt-auth.guard';
import { UsersInAdminModule } from './modules/users-in-admin/users-in-admin.module';
import { CommonModule } from './modules/common/common.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OrderStatusListModule } from './modules/order-status-list/order-status-list.module';
import { GoodsClassificationsCommonModule } from './modules/goods-classifications-common/goods-classifications-common.module';
import { ReservationSettingsModule } from './modules/reservation-settings/reservation-settings.module';
import { ReservationSettingDatesModule } from './modules/reservation-setting-dates/reservation-setting-dates.module';
import { GoodsTypesModule } from './modules/goods-types/goods-types.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'mysql',
        // synchronize: config.get('NODE_ENV') !== 'prod' ? true : false,
        synchronize: true,
        autoLoadEntities: true,
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        logging: true,
        // keepConnectionAlive: true,
        // entities: [
        //   config.get('NODE_ENV') === 'dev'
        //     ? __dirname + '/**/*.entity{.ts,.js}'
        //     : 'dist/**/*.entity{.ts,.js}',
        // ],
        // migrations: [
        //   config.get('NODE_ENV') === 'dev'
        //     ? __dirname + '/migrations/**/*{.ts,.js}'
        //     : __dirname + '../dist/migrations/**/*{.ts,.js}',
        // ],
        // cli: {
        //   migrationsDir:
        //     config.get('NODE_ENV') === 'dev'
        //       ? 'src/migrations'
        //       : 'dist/migrations',
        // },
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`],
      validationSchema: configValidationSchema,
    }),
    ThrottlerModule.forRoot({
      ttl: 60 * 1000, // 1 minute
      limit: 100,
    }),
    forwardRef(() =>
      RouterModule.register([
        {
          path: 'admin',
          module: AdminApiModule,
        },
        {
          path: 'user',
          module: UserApiModule,
        },
      ]),
    ),
    //모든 모듈 등록
    Modules,
    ReservationSettingDatesModule,
    GoodsTypesModule,
    //여기서부터 엔드포인트 등록
    // AdminApiModule,
    // UserApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
