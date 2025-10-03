// @ts-check
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  // Ignorados (reemplaza .eslintignore)
  { ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'jest.config.ts', '*.config.ts', '*.config.cjs', '*.config.mjs', 'scripts/**'] },

  // Reglas base JS
  js.configs.recommended,

  // TS sin type-check (seguro para todo .ts)
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.node, ...globals.jest },
      sourceType: 'commonjs',
    },
    plugins: { '@typescript-eslint': tsPlugin, prettier: prettierPlugin },
    rules: {
      // Apaga reglas base y usa las de TS
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-redeclare': ['error'],

      // Prettier como regla
      'prettier/prettier': 'error',

      // Tus reglas
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // TS con type-check solo en src/ y test/ (para reglas que lo requieren)
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.eslint.json'], // agrega tsconfig.build.json si lo usas
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
];


