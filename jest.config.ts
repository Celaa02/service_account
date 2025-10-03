import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/main.ts', '!src/**/index.ts'],
  coverageDirectory: 'coverage',
  moduleNameMapper: { '^src/(.*)$': '<rootDir>/src/$1' },
};

export default config;
