'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';

export async function createComment(formData: FormData) {
  const sql = neon(process.env.DATABASE_URL!);
  const comment = formData.get('comment') as string;

  if (!comment) return;

  // Prismaで作成したテーブルに直接SQLで挿入
  // @ts-ignore - neon() の型定義と実行時の不一致を解消
  await sql.query('INSERT INTO "Comment" (id, content, "createdAt") VALUES ($1, $2, $3)', [
    crypto.randomUUID(),
    comment,
    new Date(),
  ]);

  revalidatePath('/');
}

export async function getComments() {
  const sql = neon(process.env.DATABASE_URL!);
  // @ts-ignore
  const rows = await sql.query('SELECT * FROM "Comment" ORDER BY "createdAt" DESC LIMIT 10');
  return rows;
}
