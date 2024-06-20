import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import unicorn from 'eslint-plugin-unicorn'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import globals from 'globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

/** @typedef {import('@types/eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: ['**/pnpm-lock.yaml', '**/.idea/', '**/build/'],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      'plugin:@typescript-eslint/recommended',
      'plugin:unicorn/recommended',
      'plugin:prettier/recommended',
    ),
  ),
  {
    files: ['build.js', 'src/server/server.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    languageOptions: { globals: globals.browser },
    settings: { react: { version: 'detect' } },
    plugins: {
      unicorn: fixupPluginRules(unicorn),
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
    },
    rules: {
      eqeqeq: 'error',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
            pascalCase: true,
          },
        },
      ],
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          ignore: ['Props', 'searchParams', 'props'],
        },
      ],
      'unicorn/no-useless-undefined': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react-hooks/exhaustive-deps': 'off',
      'unicorn/consistent-function-scoping': 'off',
    },
  },
]
