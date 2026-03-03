-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "segment" TEXT,
    "profileManual" TEXT,
    "profileAI" TEXT,
    "profileConfidence" REAL,
    "profileConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT,
    "title" TEXT NOT NULL,
    "segment" TEXT,
    "rawTranscript" TEXT NOT NULL,
    "analysisJson" TEXT,
    "analysisVersion" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "strategicScore" REAL,
    "closingScore" REAL,
    "userFeedback" TEXT,
    "includedInPattern" BOOLEAN NOT NULL DEFAULT false,
    "promptVersion" TEXT,
    "promptHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Meeting_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatternReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingIds" TEXT NOT NULL,
    "reportJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
