import { createConfig } from '@umijs/max/test';

export default async () => {
  const config = createConfig({
    target: 'browser',
  });

  return {
    ...config,
    testEnvironmentOptions: {
      ...(config?.testEnvironmentOptions || {}),
      url: 'http://localhost:8000',
    },
    moduleNameMapper: {
      '^@/enums/(.*)$': '<rootDir>/packages/core/src/enums/$1',
      '^@/permission$': '<rootDir>/packages/core/src/permission/index.ts',
      '^@/permission/(.*)$': '<rootDir>/packages/core/src/permission/$1',
      ...(config.moduleNameMapper || {}),
      '^@/(.*)$': '<rootDir>/src/$1',
      '^@@/(.*)$': '<rootDir>/src/.umi/$1',
      '^@gosaas/api$': '<rootDir>/packages/api',
      '^@gosaas/core$': '<rootDir>/packages/core/src',
    },
    setupFiles: [...(config.setupFiles || [])],
    setupFilesAfterEnv: [...(config.setupFilesAfterEnv || []), '<rootDir>/tests/setupTests.js'],
    globals: {
      ...config.globals,
      localStorage: null,
    },
  };
};
