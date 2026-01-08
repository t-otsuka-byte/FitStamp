"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getStamps(userId: string) {
  try {
    const stamps = await prisma.stamp.findMany({
      where: {
        userId: userId,
      },
      select: {
        date: true,
      },
    });
    return stamps.map((s) => s.date);
  } catch (error) {
    console.error("Failed to get stamps:", error);
    return [];
  }
}

export async function toggleStamp(userId: string, date: string) {
  try {
    const existing = await prisma.stamp.findFirst({
      where: {
        userId: userId,
        date: date,
      },
    });

    if (existing) {
      await prisma.stamp.delete({
        where: {
          id: existing.id,
        },
      });
      console.log(`Deleted stamp for ${date}`);
    } else {
      await prisma.stamp.create({
        data: {
          userId: userId,
          date: date,
        },
      });
      console.log(`Created stamp for ${date}`);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle stamp:", error);
    return { success: false, error: "Failed to toggle stamp" };
  }
}
