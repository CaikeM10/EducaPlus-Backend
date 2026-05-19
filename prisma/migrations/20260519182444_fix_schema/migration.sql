-- CreateEnum
CREATE TYPE "LearningLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "LearningCategory" AS ENUM ('FUNDAMENTOS', 'INCLUSAO', 'AUTISMO', 'TDAH', 'DISLEXIA', 'GERAL');

-- DropIndex
DROP INDEX "Recommendation_learningPathId_idx";

-- DropIndex
DROP INDEX "Recommendation_resourceId_idx";

-- DropIndex
DROP INDEX "ResourceTag_tagId_idx";

-- DropIndex
DROP INDEX "Step_learningPathId_idx";

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LearningPath" ADD COLUMN     "category" "LearningCategory" NOT NULL DEFAULT 'GERAL',
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "level" "LearningLevel" NOT NULL DEFAULT 'BEGINNER';

-- AlterTable
ALTER TABLE "Step" ADD COLUMN     "content" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "updatedAt" DROP DEFAULT;
