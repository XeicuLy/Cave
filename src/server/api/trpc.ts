/**
 * このファイルを編集する必要はおそらくありません。ただし、次の場合には編集が必要です：
 * 1. リクエストコンテキストを変更する場合（Part 1を参照）。
 * 2. 新しいミドルウェアや手続きの種類を作成する場合（Part 3を参照）。
 *
 * TL;DR - ここはtRPCサーバーのすべての重要な部分が作成および接続される場所です。使用する必要がある要素は、最後に適切にドキュメント化されています。
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { getServerAuthSession } from '@/server/auth';
import { db } from '@/server/db';

/**
 * 1. コンテキスト
 *
 * このセクションでは、バックエンドAPIで使用可能な「コンテキスト」が定義されています。
 *
 * これにより、リクエストの処理中にデータベース、セッションなどにアクセスできます。
 *
 * このヘルパーはtRPCコンテキストの「内部」を生成します。APIハンドラーとRSCクライアントはそれぞれこれをラップし、必要なコンテキストを提供します。
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerAuthSession();

  return {
    db,
    session,
    ...opts,
  };
};

/**
 * 2. 初期化
 *
 * ここで、tRPC APIが初期化され、コンテキストとトランスフォーマーが接続されます。また、
 * ZodErrorsを解析して、バックエンドでの検証エラーが発生した場合にフロントエンドで型安全性を得ることができます。
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ルーターおよび手続き（重要な部分）
 *
 * これらはtRPC APIを構築するために使用する部分です。これらを "/src/server/api/routers" ディレクトリで頻繁にインポートする必要があります。
 */

/**
 * 新しいルーターやサブルーターを作成する方法です。
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * パブリック（未認証）手続き
 *
 * これは、tRPC APIで新しいクエリやミューテーションを構築する基本的な要素です。ユーザーが
 * 認証されているかどうかは保証されませんが、ログインしている場合はユーザーセッションデータにアクセスできます。
 */
export const publicProcedure = t.procedure;

/** 手続きを実行する前にユーザーがログインしていることを強制する再利用可能なミドルウェア。 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      // `session`を非nullとして推論
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * プロテクトされた（認証済み）手続き
 *
 * クエリまたはミューテーションがログインしたユーザーにのみアクセス可能であるようにするには、これを使用します。
 * セッションが有効であり、`ctx.session.user`がnullでないことを保証します。
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
