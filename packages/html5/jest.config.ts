import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // Run DOM tests against TypeScript sources (no build needed). Tests that
  // need a browser environment opt in per-file with a `@jest-environment jsdom`
  // docblock; the setup file polyfills what jsdom lacks (requestAnimationFrame).
  moduleNameMapper: {
    '^latex2js$': '<rootDir>/../../packages/latex2js/src/index.ts',
    '^latex2html5$': '<rootDir>/index.ts',
    '^@latex2js/pstricks$': '<rootDir>/../../packages/pstricks/src/index.ts',
    '^@latex2js/settings$': '<rootDir>/../../packages/settings/src/index.ts',
    '^@latex2js/utils$': '<rootDir>/../../packages/utils/src/index.ts',
    '^@latex2js/macros$': '<rootDir>/../../packages/macros/src/index.ts',
    '^mathjaxjs$': '<rootDir>/../../packages/mathjaxjs/src/index.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};

export default config;
