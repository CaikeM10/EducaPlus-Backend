/*
  Warnings:

  - The values [ADMIN,USER] on the enum `RoleType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `content` on the `Diary` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lessonPlanId]` on the table `Diary` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lessonPlanId` to the `Diary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatWorked` to the `Diary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Resource` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PDF', 'VIDEO', 'DOCUMENT', 'TEMPLATE');

-- AlterEnum
BEGIN;
CREATE TYPE "RoleType_new" AS ENUM ('TEACHER', 'COORDINATOR', 'SPECIAL_ED');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "RoleType_new" USING ("role"::text::"RoleType_new");
ALTER TYPE "RoleType" RENAME TO "RoleType_old";
ALTER TYPE "RoleType_new" RENAME TO "RoleType";
DROP TYPE "RoleType_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'TEACHER';
COMMIT;

-- AlterTable
ALTER TABLE "Diary" DROP COLUMN "content",
ADD COLUMN     "inclusionReflection" TEXT,
ADD COLUMN     "lessonPlanId" TEXT NOT NULL,
ADD COLUMN     "studentResponse" TEXT,
ADD COLUMN     "whatFailed" TEXT,
ADD COLUMN     "whatWorked" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LessonPlan" ADD COLUMN     "inclusions" TEXT[],
ADD COLUMN     "objectives" TEXT[],
ADD COLUMN     "strategies" TEXT[];

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "ResourceType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'TEACHER';

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceTag" (
    "resourceId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceTag_pkey" PRIMARY KEY ("resourceId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "ResourceTag_tagId_idx" ON "ResourceTag"("tagId");

-- CreateIndex
CREATE INDEX "Diagnosis_userId_idx" ON "Diagnosis"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Diary_lessonPlanId_key" ON "Diary"("lessonPlanId");

-- CreateIndex
CREATE INDEX "Diary_userId_idx" ON "Diary"("userId");

-- CreateIndex
CREATE INDEX "Recommendation_diagnosisId_idx" ON "Recommendation"("diagnosisId");

-- CreateIndex
CREATE INDEX "Recommendation_learningPathId_idx" ON "Recommendation"("learningPathId");

-- CreateIndex
CREATE INDEX "Resource_categoryId_idx" ON "Resource"("categoryId");

-- CreateIndex
CREATE INDEX "Resource_stepId_idx" ON "Resource"("stepId");

-- CreateIndex
CREATE INDEX "Resource_createdById_idx" ON "Resource"("createdById");

-- CreateIndex
CREATE INDEX "UserProgress_stepId_idx" ON "UserProgress"("stepId");

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceTag" ADD CONSTRAINT "ResourceTag_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceTag" ADD CONSTRAINT "ResourceTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diary" ADD CONSTRAINT "Diary_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
