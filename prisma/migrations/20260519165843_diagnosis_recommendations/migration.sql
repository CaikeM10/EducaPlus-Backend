/*
  Warnings:

  - Added the required column `updatedAt` to the `Diagnosis` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `result` on the `Diagnosis` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Diary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LearningPath` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LessonPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Step` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DiagnosisResult" AS ENUM ('GENERAL_PEDAGOGY', 'INCLUSIVE_EDUCATION', 'AUTISM_SUPPORT', 'TDAH_SUPPORT', 'DYSLEXIA_SUPPORT');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Diagnosis" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "result",
ADD COLUMN     "result" "DiagnosisResult" NOT NULL;

-- AlterTable
ALTER TABLE "Diary" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "LearningPath" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "LessonPlan" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Recommendation" ADD COLUMN     "reason" TEXT,
ADD COLUMN     "resourceId" TEXT;

-- AlterTable
ALTER TABLE "Step" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Diagnosis_result_idx" ON "Diagnosis"("result");

-- CreateIndex
CREATE INDEX "LearningPath_createdById_idx" ON "LearningPath"("createdById");

-- CreateIndex
CREATE INDEX "LessonPlan_userId_idx" ON "LessonPlan"("userId");

-- CreateIndex
CREATE INDEX "Recommendation_resourceId_idx" ON "Recommendation"("resourceId");

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
