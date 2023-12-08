import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';

import { env } from '@/env';
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';

/**
 * この関数は `createTRPCContext` ヘルパーをラップし、HTTPリクエストを処理する際（たとえばクライアントコンポーネントからリクエストを行う場合）にtRPC APIに必要なコンテキストを提供します。
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

/**
 * tRPCリクエストハンドラーのエントリーポイントです。HTTPリクエストを処理し、tRPC APIとの通信を可能にします。
 */
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
          }
        : undefined,
  });

// GETリクエストとPOSTリクエストの両方で同じハンドラーを使用します
export { handler as GET, handler as POST };
