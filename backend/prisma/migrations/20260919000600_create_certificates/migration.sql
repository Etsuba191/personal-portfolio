CREATE TABLE "Certificate" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(180) NOT NULL,
  "issuer" VARCHAR(160) NOT NULL,
  "issueDate" VARCHAR(40),
  "credentialUrl" TEXT,
  "fileUrl" TEXT NOT NULL,
  "publicId" TEXT,
  "fileName" VARCHAR(180) NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Certificate_sortOrder_createdAt_idx" ON "Certificate" ("sortOrder", "createdAt");