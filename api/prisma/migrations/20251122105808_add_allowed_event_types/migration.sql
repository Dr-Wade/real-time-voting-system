-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowedEventTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];
