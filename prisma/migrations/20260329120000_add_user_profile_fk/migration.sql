-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "display_name" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- Backfill: 既存 Stamp の userId ごとに親行を作る（匿名・認証どちらも）
INSERT INTO "UserProfile" ("id", "display_name", "updated_at")
SELECT DISTINCT "userId", NULL, CURRENT_TIMESTAMP
FROM "Stamp";

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
