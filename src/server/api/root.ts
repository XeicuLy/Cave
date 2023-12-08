import { postRouter } from '@/server/api/routers/post';
import { createTRPCRouter } from '@/server/api/trpc';

/**
 * これはサーバーのメインルーターです。
 *
 * /api/routers で追加されたすべてのルーターは、ここに手動で追加する必要があります。
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
});

// APIの型定義をエクスポート
export type AppRouter = typeof appRouter;
