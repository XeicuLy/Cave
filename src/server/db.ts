import { PrismaClient } from '@prisma/client';

import { env } from '@/env';

// PrismaClientのインスタンスをグローバルオブジェクトにアタッチする
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * db:
 * - PrismaClientのインスタンスを管理するための変数。
 * - 開発環境ではクエリ、エラー、警告をログに記録する。
 * - グローバルオブジェクトにPrismaClientのインスタンスがない場合は新しく作成し、
 *   本番環境でない場合はグローバルオブジェクトに保存する。
 */
export const db =
  globalForPrisma.prisma ??
  // グローバルオブジェクトにPrismaClientのインスタンスがなければ新しく作成
  new PrismaClient({
    // 開発環境の場合、クエリ、エラー、警告をログに記録
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 本番環境でなければ、グローバルオブジェクトにPrismaClientのインスタンスを保存
if (env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

/**
 * db:
 * - PrismaClientのインスタンスを管理するための変数。
 * - 開発環境ではクエリ、エラー、警告をログに記録する。
 * - グローバルオブジェクトにPrismaClientのインスタンスがない場合は新しく作成し、
 *   本番環境でない場合はグローバルオブジェクトに保存する。
 */
