import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';

import { type AppRouter } from '@/server/api/root';

// Transformerの設定
export const transformer = superjson;

/**
 * ベースURLを取得する関数
 *
 * この関数は、環境に応じてベースURLを返します。
 * ブラウザ環境（`window` が定義されている場合）では空文字列を返し、
 * Vercel のデプロイ環境では `https://${process.env.VERCEL_URL}` を、
 * それ以外の環境では `http://localhost:${process.env.PORT ?? 3000}` を返します。
 *
 */
function getBaseUrl(): string {
  // ブラウザ環境の場合は空文字列を返す
  if (typeof window !== 'undefined') return '';
  // Vercel のデプロイ環境の場合は Vercel のURLを使用
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // それ以外の環境ではローカルの開発用ポートを使用
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * APIエンドポイントのURLを取得する関数
 *
 * この関数は、ベースURLと `/api/trpc` を結合して API エンドポイントの完全な URL を返します。
 * ベースURLの取得には、外部から提供される `getBaseUrl` 関数を使用します。
 *
 */
export function getUrl(): string {
  // getBaseUrl 関数を呼び出してベースURLを取得し、それに '/api/trpc' を結合して返す
  return getBaseUrl() + '/api/trpc';
}

/**
 * 入力の型を推論するためのヘルパー
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * 出力の型を推論するためのヘルパー
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
