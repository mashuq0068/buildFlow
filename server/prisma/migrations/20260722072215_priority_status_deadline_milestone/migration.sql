-- AlterEnum
ALTER TYPE "IssuePriority" ADD VALUE 'CRITICAL';

-- AlterEnum
ALTER TYPE "StatusCategory" ADD VALUE 'BLOCKED';

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "blockedById" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
