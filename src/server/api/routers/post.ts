import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';

/**
 * "postRouter"はtRPCのルーターを構築するためのオブジェクトです。
 * このルーターは特定の手続き（queriesやmutations）をグループ化し、関連するロジックを提供します。
 * 以下はこの"postRouter"が提供する手続きの概要です。
 */
export const postRouter = createTRPCRouter({
  /**
   * パブリック手続き: "hello"
   *
   * ユーザーが未認証でもアクセス可能なクエリです。
   * テキストを受け取り、挨拶メッセージを返します。
   */
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.text}`,
    };
  }),

  /**
   * プロテクトされた手続き: "create"
   *
   * ユーザーが認証されている必要があるミューテーションです。
   * 名前を受け取り、データベースに投稿を作成します。
   * （デモ目的でデータベース呼び出しを遅延させています）
   */
  create: protectedProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    // データベース呼び出しを遅延させる（シミュレート）
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return ctx.db.post.create({
      data: {
        name: input.name,
        createdBy: { connect: { id: ctx.session.user.id } },
      },
    });
  }),

  /**
   * プロテクトされた手続き: "getLatest"
   *
   * ユーザーが認証されている必要があるクエリです。
   * データベースから最新の投稿を取得します。
   */
  getLatest: protectedProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: 'desc' },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),

  /**
   * プロテクトされた手続き: "getSecretMessage"
   *
   * ユーザーが認証されている必要があるクエリです。
   * 秘密のメッセージを返します。
   */
  getSecretMessage: protectedProcedure.query(() => {
    return 'you can now see this secret message!';
  }),
});
