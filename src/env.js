import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/** サーバーサイドおよびクライアントサイドの環境変数のスキーマを指定  */
export const env = createEnv({
  /**
   * サーバーサイドの環境変数のスキーマをここに指定します。
   * これにより、アプリが無効な環境変数で構築されないようにできます。
   */
  server: {
    // データベースのURLは正しい形式であることを確認し、デフォルトのURLを変更し忘れていないかを確認
    DATABASE_URL: z
      .string()
      .url()
      .refine((str) => !str.includes('YOUR_MYSQL_URL_HERE'), 'デフォルトのURLを変更し忘れています'),
    // 開発、テスト、本番のいずれかの値であることを確認
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // 本番環境では必須、それ以外ではオプションとなるNextAuthの秘密鍵
    NEXTAUTH_SECRET: process.env.NODE_ENV === 'production' ? z.string() : z.string().optional(),
    // VercelのデプロイでNEXTAUTH_URLが設定されていない場合、Vercel_URLがデフォルトとして使用されるようにする
    NEXTAUTH_URL: z.preprocess(
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URLに`https`が含まれていない場合、URLとして検証できない
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    // DISCORD_CLIENT_IDとDISCORD_CLIENT_SECRETが空でないことを確認
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
  },

  /**
   * クライアントサイドの環境変数のスキーマをここに指定します。
   * クライアントに公開するためには、`NEXT_PUBLIC_`でプレフィックスを付けます。
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * Next.jsのエッジランタイム（ミドルウェアなど）またはクライアントサイドでは、
   * 通常のオブジェクトとして`process.env`を分解できないため、手動で分解する必要があります。
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  },
  /**
   * `SKIP_ENV_VALIDATION`で`build`または`dev`を実行して環境の検証をスキップします。
   * これは特にDockerビルドに役立ちます。
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * 空の文字列がundefinedとして扱われるようにします。
   * `SOME_VAR: z.string()`および`SOME_VAR=''`はエラーをスローします。
   */
  emptyStringAsUndefined: true,
});
