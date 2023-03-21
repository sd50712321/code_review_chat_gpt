import { cpus } from 'os';

const cpuCount = cpus().length;
const maxConcurrency = cpuCount > 4 ? cpuCount - 2 : cpuCount;

module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/test/$1',
  },
  bail: true,
  setupFiles: ['<rootDir>/test/config/jest-unhandleRejection.setup.ts'],
  setupFilesAfterEnv: ['jest-extended/all'],
  maxConcurrency,
  maxWorkers: maxConcurrency,
  testTimeout: 60000,
};
