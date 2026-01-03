import { dirname } from 'path';
import { fileURLToPath } from 'url';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [
  {
    ignores: ['**/public/**', '.next/**', 'out/**', 'node_modules/**']
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // TypeScript
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',

      // React
      'react/jsx-no-target-blank': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',

      // Formatting
      'space-before-blocks': ['error', 'always'],
      'object-curly-spacing': ['warn', 'always'],
      indent: 'off',
      'array-bracket-spacing': 'warn',
      'linebreak-style': 'off',
      'keyword-spacing': 'warn',
      'comma-dangle': 'warn',
      'comma-spacing': 'warn',
      'arrow-spacing': 'warn',

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
