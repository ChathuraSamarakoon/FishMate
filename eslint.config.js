const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  { ignores: ['dist/**', '.expo/**'] },
  expo,
  prettier,
  {
    rules: {
      'react-hooks/refs': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
