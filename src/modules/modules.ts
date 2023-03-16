import { forwardRef, Module } from '@nestjs/common';
import { AdminApiModule } from 'src/controllers/admin-controller.module';
import { UserApiModule } from 'src/controllers/user-controller.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AdminApiModule),
    forwardRef(() => UserApiModule),
  ],
})
export class Modules {}
