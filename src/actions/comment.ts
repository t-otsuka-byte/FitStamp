'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createComment(formData: FormData) {
  const comment = formData.get('comment') as string;

  if (!comment) return;

  await prisma.comment.create({
    data: { content: comment },
  });

  revalidatePath('/');
}

export async function getComments() {
  return prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}
