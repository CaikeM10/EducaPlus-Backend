-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'READY_FOR_QUIZ', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MaterialConsumptionStatus" AS ENUM ('NOT_STARTED', 'OPENED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "ResourceConsumption" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "stepId" TEXT,
    "status" "MaterialConsumptionStatus" NOT NULL DEFAULT 'OPENED',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "progressPercent" INTEGER,
    "progressSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "materialsCompleted" BOOLEAN NOT NULL DEFAULT false,
    "quizPassed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResourceConsumption_userId_idx" ON "ResourceConsumption"("userId");

-- CreateIndex
CREATE INDEX "ResourceConsumption_resourceId_idx" ON "ResourceConsumption"("resourceId");

-- CreateIndex
CREATE INDEX "ResourceConsumption_stepId_idx" ON "ResourceConsumption"("stepId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceConsumption_userId_resourceId_stepId_key" ON "ResourceConsumption"("userId", "resourceId", "stepId");

-- CreateIndex
CREATE INDEX "LessonProgress_userId_idx" ON "LessonProgress"("userId");

-- CreateIndex
CREATE INDEX "LessonProgress_stepId_idx" ON "LessonProgress"("stepId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_stepId_key" ON "LessonProgress"("userId", "stepId");

-- AddForeignKey
ALTER TABLE "ResourceConsumption" ADD CONSTRAINT "ResourceConsumption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceConsumption" ADD CONSTRAINT "ResourceConsumption_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceConsumption" ADD CONSTRAINT "ResourceConsumption_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE CASCADE ON UPDATE CASCADE;
