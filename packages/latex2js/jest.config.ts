import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // Run against TypeScript sources (no build needed).
  moduleNameMapper: {
    '^@latex2js/pstricks$': '<rootDir>/../../packages/pstricks/src/index.ts',
    '^@latex2js/settings$': '<rootDir>/../../packages/settings/src/index.ts',
    '^@latex2js/utils$': '<rootDir>/../../packages/utils/src/index.ts',
  },
};

export default config;
