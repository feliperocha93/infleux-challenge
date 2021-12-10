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
    'class-methods-use-this': 'off',
    camelcase: 'off',
  },
  overrides: [
    {
      files: ['*.test.js'],
      rules: {
        'no-undef': 'off',
        'no-underscore-dangle': 'off',
      },
    },
  ],

};
