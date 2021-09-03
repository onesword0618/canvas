module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  roots: [
    '<rootDir>/test'
  ],
  reporters: ["default","jest-junit"],
  testEnvironment: 'jest-environment-node',
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)'
  ],
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$'
  ],
  testResultsProcessor: "jest-junit"
};
