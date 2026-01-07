import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  {
    ignores: [
      '**/public/**',
      '**/.next/**',
      '**/out/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/build/**'
    ]
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      'no-unused-vars': ['off'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      'react/jsx-no-target-blank': 'off',
      'react/prop-types': 0,
      'react/display-name': 0,
      'space-before-blocks': ['error', 'always'],
      'object-curly-spacing': [1, 'always'],
      indent: ['off', 2],
      // quotes: ['warn', 'single'],
      'array-bracket-spacing': 1,
      'linebreak-style': 0,
      'keyword-spacing': 1,
      'comma-dangle': 1,
      'comma-spacing': 1,
      'arrow-spacing': 1,

      // Hooks & Refresh
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // 'react-refresh/only-export-components': [
      //   'warn',
      //   { allowConstantExport: true }
      // ],

      // Code quality
      'no-console': 'warn',
      'no-multi-spaces': 'warn',
      'no-multiple-empty-lines': 'warn',
      'no-unexpected-multiline': 'warn',
      'no-debugger': 'warn',
      'no-duplicate-imports': 'warn',
      'no-empty-function': 'off',
      'prefer-const': 'off'
    }
  }
];

export default eslintConfig;
