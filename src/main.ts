import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  AllExceptionsFilter,
  ValidationExceptionFilter,
} from './interceptor/all-exception.filters';
import { ResponseTransformInterceptor } from './interceptor/transform.response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { DOMAIN, PORT } from './environment';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { AdminApiModule } from './controllers/admin-controller.module';
import { UserApiModule } from './controllers/user-controller.module';
import * as fs from 'fs';
import * as environment from './environment';

// ormconfig.json 생성 migration시 db내용이 json에 포함되어야 하므로 ormconfig.json은 동적으로 생성할 수 있도록, ignore에도 추가해주어야함
async function makeOrmConfig() {
  const { ormConfig } = environment;

  if (fs.existsSync('./ormconfig.json')) {
    fs.unlinkSync('./ormconfig.json');
  }

  fs.writeFileSync('./ormconfig.json', JSON.stringify(ormConfig(), null, 2));
}

async function bootstrap() {
  const logger = new Logger('bootstrap');
  await makeOrmConfig();
  try {
    // error 로그 레벨 조정 production일 경우 error, warn 경우만 로그를 출력하도록 설정
    const app = await NestFactory.create(AppModule, {
      logger:
        // process.env.NODE_ENV === 'production'
        process.env.NODE_ENV === 'prod'
          ? ['error', 'warn']
          : ['log', 'debug', 'error', 'verbose', 'warn'],
    });

    // 응답 타입 제한 entity에서 exclude 된 타입은 제외
    app.useGlobalInterceptors(new TransformInterceptor());

    // dto 타입 제한
    app.useGlobalPipes(
      new ValidationPipe({
        // dto 정의한 타입만 허용
        whitelist: true,
        forbidNonWhitelisted: true,
        // dto 타입 자동 변환
        transform: true,
        transformOptions: {
          // 타입 암묵적 허용
          enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
          logger.error('exceptionFactory', errors);
          return new BadRequestException(errors);
        },
      }),
    );

    // response 객체에 result:true 프로퍼티 추가
    app.useGlobalInterceptors(new ResponseTransformInterceptor());

    // sql 에러 처리
    app.useGlobalFilters(new AllExceptionsFilter());

    // validation 에러 처리
    app.useGlobalFilters(new ValidationExceptionFilter());

    // cors 허용 우선 모든 요청에 대해서 허용
    app.enableCors();

    app.use(
      helmet({
        // csp 설정
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
          },
        },
      }),
    );

    // swagger 설정
    const SwaggerAdminOptions = new DocumentBuilder()
      .setTitle(`minds-ai api admin ${process.env.NODE_ENV}`)
      .setDescription('minds-ai api admin')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'Bearer',
        in: 'header',
        name: 'Authorization',
        description: '로그인 후 받는 토큰 입력',
      })
      .build();
    const documentAdmin = SwaggerModule.createDocument(
      app,
      SwaggerAdminOptions,
      {
        include: [AdminApiModule],
      },
    );
    SwaggerModule.setup('api/admin', app, documentAdmin);

    const SwaggerUserOptions = new DocumentBuilder()
      .setTitle(`minds-ai api user ${process.env.NODE_ENV}`)
      .setDescription('minds-ai api user')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'Bearer',
        in: 'header',
        name: 'Authorization',
        description: '로그인 후 받는 토큰 입력',
      })
      .build();
    const documentUser = SwaggerModule.createDocument(app, SwaggerUserOptions, {
      include: [UserApiModule],
    });
    SwaggerModule.setup('api/user', app, documentUser);

    await app.listen(PORT);
    // log node env
    // logger.log(`log NODE_ENV : ${process.env.NODE_ENV}`);
    // Logger.log(`log NODE_ENV : ${process.env.NODE_ENV}`);

    process.env.NODE_ENV != 'prod'
      ? Logger.log(
          `🚀  Local Server ready at https://${DOMAIN!}:${PORT!}`,
          'Bootstrap',
        )
      : Logger.log(
          `🚀  Poduction Server ready at https://${DOMAIN!}:${PORT!}`,
          'Bootstrap',
        );
  } catch (err) {
    logger.error(err);
  }
}
bootstrap();
