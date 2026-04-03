import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  { ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**'] },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      curly: ['error', 'all'],
      'id-length': ['warn', { min: 2, exceptions: ['_'] }],
    },
  }
);
