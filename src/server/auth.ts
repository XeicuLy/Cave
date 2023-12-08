import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { getServerSession, type DefaultSession, type NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

import { env } from '@/env';
import { db } from '@/server/db';

/**
 * `next-auth`の型のためのモジュール拡張。`session`オブジェクトにカスタムプロパティを追加し、型の安全性を保つことができます。
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...他のプロパティ
      // role: UserRole;
    } & DefaultSession['user'];
  }

  // interface User {
  //   // ...他のプロパティ
  //   // role: UserRole;
  // }
}

/**
 * NextAuth.jsの設定オプション。アダプターやプロバイダー、コールバックなどの構成に使用されます。
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  /**
   * セッションを処理するためのコールバック。ユーザーIDをセッションオブジェクトに追加します。
   */
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  // 提供されたPrismaClientインスタンスを使用したNextAuth.jsのPrismaアダプター。
  adapter: PrismaAdapter(db),
  // Discord認証プロバイダーの構成。
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    /**
     * ...ここに他のプロバイダーを追加してください。
     *
     * Discordプロバイダー以外の多くのプロバイダーは、少しの追加作業が必要です。
     * 例えばGitHubプロバイダーはAccountモデルに`refresh_token_expires_in`フィールドを追加する必要があります。
     * 使用したいプロバイダーに関する詳細は、NextAuth.jsのドキュメントを参照してください。例:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * `getServerSession`のラッパー。各ファイルで`authOptions`を個別にインポートする必要がないようにします。
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
