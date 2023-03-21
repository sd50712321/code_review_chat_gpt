import { cpus } from 'os'

const cpuCount = cpus().length
const maxConcurrency = cpuCount > 4 ? cpuCount - 2 : cpuCount

module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/db/models/',
    '/documentations/',
    '/exampleService',
    '/temp/',
    '/test/',
    '/coverage/',
    'src/db/migrations/',
    'src/config/',
    'src/auth/',
    'src/common/decorators/user.decorator.ts', // User 데코레이터
    'src/common/middlewares/logger.middleware.ts', // 디버깅용 로그 미들웨어
    'src/health', // probe 용 모듈
  ],
  coverageDirectory: 'test/coverage',
  // testPathIgnorePatterns: [],
  rootDir: '../../',
  verbose: true,
  logHeapUsage: true,
  cache: false,
  bail: true,
  testRegex: '.spec.ts$',
  transform: {
    // 원본 '^.+\\.(t|j)s$': 'ts-jest',
    '^.+\\.(t|j)s$': '<rootDir>/test/config/jest-fix-istanbul-decorators.ts',
  },
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/test/$1',
  },
  setupFiles: ['<rootDir>/test/config/jest-unhandleRejection.setup.ts'],
  setupFilesAfterEnv: ['jest-extended/all'],
  testTimeout: 10000,
  maxConcurrency,
  maxWorkers: maxConcurrency,
}
// "test:cov": "jest --coverage --config ./test/config/jest-coverage.js",
