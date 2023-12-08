import 'server-only';

import { createTRPCProxyClient, loggerLink, TRPCClientError } from '@trpc/client';
import { callProcedure } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { type TRPCErrorResponse } from '@trpc/server/rpc';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { transformer } from './shared';

/**
 * `createTRPCContext` ヘルパーをラップし、React Server Component からの tRPC コールを処理する際に必要なコンテキストを提供します。
 * このモジュールでは、`api` オブジェクトをエクスポートしています。
 */
const createContext = cache(() => {
  return createTRPCContext({
    headers: new Headers({
      cookie: cookies().toString(),
      'x-trpc-source': 'rsc',
    }),
  });
});

/**
 * `api` オブジェクトは、tRPC プロキシクライアントを作成し、サーバーコンポーネントで使用されるためのカスタムリンクも提供します。
 */
export const api = createTRPCProxyClient<typeof appRouter>({
  transformer,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === 'development' || (op.direction === 'down' && op.result instanceof Error),
    }),
    /**
     * HTTPリクエストを使用せずにプロシージャを呼び出すためのカスタムRSCリンク。
     * サーバーコンポーネントは常にサーバー上で実行されるため、単純にプロシージャを関数として呼び出すことができます。
     */
    () =>
      /**
       * プロシージャを呼び出し、結果をオブザーバーに通知します。
       */
      ({ op }) =>
        observable((observer) => {
          createContext()
            .then((ctx) => {
              return callProcedure({
                procedures: appRouter._def.procedures,
                path: op.path,
                rawInput: op.input,
                ctx,
                type: op.type,
              });
            })
            .then((data) => {
              observer.next({ result: { data } });
              observer.complete();
            })
            .catch((cause: TRPCErrorResponse) => {
              observer.error(TRPCClientError.from(cause));
            });
        }),
  ],
});
