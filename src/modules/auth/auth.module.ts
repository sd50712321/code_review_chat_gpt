import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/utils/jwt/admin/guards/jwt-auth.guard';
import { AuthController } from './auth.controller';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() =>
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: +configService.get('JWT_EXPIRATION_TIME'),
            // expiresIn: 60 * 60,
          },
        }),
      }),
    ),
  ],
  exports: [PassportModule, JwtAuthGuard, RolesGuard],
  controllers: [AuthController],
  providers: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
