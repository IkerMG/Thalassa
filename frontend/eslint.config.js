import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'src/api/generated/'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      // Downgraded: label-less inputs are widespread in this project's form pattern
      'jsx-a11y/label-has-associated-control': 'warn',
      // Downgraded: backdrop divs use document-level Escape handler for keyboard
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      // Downgraded: resetting form state on dialog close is a legitimate pattern
      'react-hooks/set-state-in-effect': 'warn',
    },
  },

  prettierConfig,
);
