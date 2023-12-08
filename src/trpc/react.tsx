'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { loggerLink, unstable_httpBatchStreamLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';

import { type AppRouter } from '@/server/api/root';
import { getUrl, transformer } from './shared';

// TRPCReactProviderで使用するTRPCReactのインスタンスを作成
export const api = createTRPCReact<AppRouter>();

/**
 * TRPCReactProvider:
 * - React Queryとtrpcを組み合わせたコンポーネントのプロバイダー。
 * - QueryClientとtrpcClientのインスタンスを作成し、Providerでラップする。
 * - trpcClientにはロギングリンクとHTTPバッチストリームリンクが適用される。
 * - props:
 *    - children: プロバイダーでラップするReactの子要素。
 *    - cookies: APIリクエスト時に使用されるクッキー情報。
 */
export function TRPCReactProvider(props: { children: React.ReactNode; cookies: string }) {
  // QueryClientのインスタンスをuseStateを使用して作成
  const [queryClient] = useState(() => new QueryClient());

  // trpcClientのインスタンスをuseStateを使用して作成
  const [trpcClient] = useState(() =>
    api.createClient({
      transformer,
      // trpcクライアントに適用するリンクの設定
      links: [
        // ロギングリンク。開発環境またはリクエストがエラーの場合に有効
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === 'development' || (op.direction === 'down' && op.result instanceof Error),
        }),
        // HTTPバッチストリームリンク。APIのURLやヘッダーの設定など
        unstable_httpBatchStreamLink({
          url: getUrl(),
          headers() {
            return {
              cookie: props.cookies,
              'x-trpc-source': 'react',
            };
          },
        }),
      ],
    }),
  );

  // QueryClientProviderとapi.Providerでラップし、props.childrenを表示
  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}
