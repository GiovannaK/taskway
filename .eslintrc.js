module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-console': 'off',
    'import/first': 'off',
    'no-param-reassign': 'off',
    'linebreak-style': 'off',
    'no-useless-catch': 'off',
  },
};
