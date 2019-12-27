// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  bail: true,
  clearMocks: true,
  testEnvironment: 'node',

  testRegex: '/tests/[^/]*\\.ts$',

  transform: { '^.+\\.tsx?$': 'ts-jest' },

  modulePathIgnorePatterns: ['<rootDir>/package.json'],

  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts'],
};

if (process.env.JEST_IMPORT_OVERRIDE) {
  module.exports.moduleNameMapper = {
    '^\\.\\.$': process.env.JEST_IMPORT_OVERRIDE,
  };
}
