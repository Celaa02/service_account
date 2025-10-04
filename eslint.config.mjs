// @ts-check
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  { ignores: ['node_modules/**','dist/**','coverage/**','jest.config.ts','*.config.*','scripts/**'] },

  js.configs.recommended,

  {
    files: ['**/*.ts','**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { tsconfigRootDir: import.meta.dirname, ecmaVersion: 'latest' },
      globals: { ...globals.node, ...globals.jest },
      sourceType: 'module',
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-unused-vars': ['error',{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-redeclare': ['error'],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  eslintConfigPrettier,
];



