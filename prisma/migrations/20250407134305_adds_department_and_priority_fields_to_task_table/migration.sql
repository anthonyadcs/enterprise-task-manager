/*
  Warnings:

  - You are about to drop the column `category` on the `Task` table. All the data in the column will be lost.
  - Added the required column `department` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "companyId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("companyId", "createdAt", "endDate", "id", "managerId", "staffId", "startDate", "status", "title", "updatedAt") SELECT "companyId", "createdAt", "endDate", "id", "managerId", "staffId", "startDate", "status", "title", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
