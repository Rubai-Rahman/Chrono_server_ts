import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';

// Manually define the paths instead of importing from tsconfig.json
const compilerOptions = {
  paths: {
    "@config/*": ["src/config/*"],
    "@middleware/*": ["src/middleware/*"],
    "@modules/*": ["src/modules/*"],
    "@utils/*": ["src/utils/*"]
  }
};

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  setupFilesAfterEnv: ['<rootDir>/test/setupTestDB.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
    }],
  },
  testTimeout: 30000, // 30 seconds timeout for tests
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/test/'
  ],
};

export default config;
