import NextAuth from 'next-auth';

import { authOptions } from '@/server/auth';
/**
 * NextAuthの`authOptions`を使用してハンドラーを作成します。
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const handler = NextAuth(authOptions);

// GETリクエストとPOSTリクエストの両方で同じハンドラーを使用します
export { handler as GET, handler as POST };
