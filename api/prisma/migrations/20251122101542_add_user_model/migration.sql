-- CreateTable
CREATE TABLE "User" (
    "personID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("personID")
);

-- DropIndex
DROP INDEX "Vote_sessionId_pollId_key";

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "personID" TEXT;

-- Migrate existing votes: use sessionId as personID
UPDATE "Vote" SET "personID" = "sessionId" WHERE "personID" IS NULL;

-- Create users for existing sessionIds
INSERT INTO "User" ("personID", "name", "createdAt", "updatedAt")
SELECT DISTINCT "sessionId", 'Guest-' || SUBSTRING("sessionId", 1, 8), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Vote"
WHERE "sessionId" NOT IN (SELECT "personID" FROM "User")
ON CONFLICT DO NOTHING;

-- Make personID NOT NULL
ALTER TABLE "Vote" ALTER COLUMN "personID" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vote_personID_pollId_key" ON "Vote"("personID", "pollId");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_personID_fkey" FOREIGN KEY ("personID") REFERENCES "User"("personID") ON DELETE RESTRICT ON UPDATE CASCADE;
