CREATE TABLE "LoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResourceDownload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResourceDownload_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LoginEvent_userId_idx" ON "LoginEvent"("userId");
CREATE INDEX "LoginEvent_createdAt_idx" ON "LoginEvent"("createdAt");
CREATE INDEX "ResourceDownload_userId_idx" ON "ResourceDownload"("userId");
CREATE INDEX "ResourceDownload_resourceId_idx" ON "ResourceDownload"("resourceId");
CREATE INDEX "ResourceDownload_createdAt_idx" ON "ResourceDownload"("createdAt");

ALTER TABLE "LoginEvent" ADD CONSTRAINT "LoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResourceDownload" ADD CONSTRAINT "ResourceDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResourceDownload" ADD CONSTRAINT "ResourceDownload_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
