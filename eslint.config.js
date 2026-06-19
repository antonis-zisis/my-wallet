import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/generated/**',
    ],
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'sort-destructure-keys': sortDestructureKeys,
    },
    rules: {
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'sort-destructure-keys/sort-destructure-keys': 'error',

      curly: ['error', 'all'],
      'id-length': ['warn', { min: 2, exceptions: ['_', 'r'] }],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
    },
  }
);
