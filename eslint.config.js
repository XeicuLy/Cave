// @ts-nocheck
import js from '@eslint/js';
import tsEsLintPlugin from '@typescript-eslint/eslint-plugin';
import tsEsLintParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

// ESLintの設定
const config = [
  // 特定のディレクトリを無視する
  { ignores: ['dist'] },
  // JavaScriptの推奨設定を使用
  js.configs.recommended,
  // Prettierの設定
  eslintConfigPrettier,
  {
    plugins: {
      '@typescript-eslint': tsEsLintPlugin,
    },
    languageOptions: {
      // JavaScript用のグローバル変数
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
    languageOptions: {
      // TypeScriptのパーサーを指定
      parser: tsEsLintParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      // TypeScript用のグローバル変数
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // eslint-recommendedのルールを含む
      ...tsEsLintPlugin.configs['eslint-recommended'].overrides[0].rules,
      // recommended-type-checkedのルールを含む
      ...tsEsLintPlugin.configs['recommended-type-checked'].rules,
    },
  },
];

export default config;
