/*
  Warnings:

  - You are about to drop the `NoteShare` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Note" ADD COLUMN "sharedWith" TEXT[] DEFAULT '{}';
ALTER TABLE "Note" ADD COLUMN "isShared" BOOLEAN DEFAULT false;

-- CreateIndex
CREATE INDEX "Note_isShared_idx" ON "Note"("isShared");
