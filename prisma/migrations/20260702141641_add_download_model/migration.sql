-- CreateEnum
CREATE TYPE "DownloadStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "downloads" (
    "id" TEXT NOT NULL,
    "videoUrl" VARCHAR(500) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "title" VARCHAR(500),
    "thumbnail" TEXT,
    "status" "DownloadStatus" NOT NULL DEFAULT 'PENDING',
    "format" VARCHAR(20),
    "quality" VARCHAR(20),
    "userId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
