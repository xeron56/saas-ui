export default {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost:8000',
  },
  setupFiles: ['./tests/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@@/(.*)$': '<rootDir>/src/.umi/$1',
    '^@gosaas/api$': '<rootDir>/packages/api',
    '^@gosaas/api/(.*)$': '<rootDir>/packages/api/$1',
    '^@gosaas/core$': '<rootDir>/packages/core/src',
    '^@gosaas/core/(.*)$': '<rootDir>/packages/core/src/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
      },
    ],
  },
};
