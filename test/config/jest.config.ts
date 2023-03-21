import { cpus } from 'os';

const cpuCount = cpus().length;
const maxConcurrency = cpuCount > 4 ? cpuCount - 2 : cpuCount;
// 프로젝트 루트 기준
module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../../',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  verbose: true,
  logHeapUsage: true,
  cache: false,
  bail: true,
  testEnvironment: 'node',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/test/$1',
  },
  setupFiles: ['<rootDir>/test/config/jest-unhandleRejection.setup.ts'],
  setupFilesAfterEnv: ['jest-extended/all'],
  maxConcurrency,
  maxWorkers: maxConcurrency,
};
