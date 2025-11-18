const js = require('@eslint/js');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
  // Base ESLint recommended rules
  js.configs.recommended,

  // React plugin flat config
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React 19 doesn't need React in scope
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',

      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Common issues
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Ignore patterns
  {
    ignores: [
      'build/**',
      'build-extension/**',
      'build-extension-mozilla/**',
      'node_modules/**',
      'src/adapter/**/*',
      '*.config.js',
    ],
  },
];
