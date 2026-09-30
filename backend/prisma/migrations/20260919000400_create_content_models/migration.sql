CREATE TABLE "AboutContent" (
  "id" INTEGER PRIMARY KEY DEFAULT 1,
  "heading" VARCHAR(160) NOT NULL,
  "paragraphs" TEXT[] NOT NULL DEFAULT '{}',
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "SkillGroup" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(100) NOT NULL,
  "skills" TEXT[] NOT NULL DEFAULT '{}',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Experience" (
  "id" SERIAL PRIMARY KEY,
  "organization" VARCHAR(160) NOT NULL,
  "role" VARCHAR(160) NOT NULL,
  "division" VARCHAR(160),
  "startDate" VARCHAR(40) NOT NULL,
  "endDate" VARCHAR(40) NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "CvDocument" (
  "id" SERIAL PRIMARY KEY,
  "url" TEXT NOT NULL,
  "publicId" TEXT,
  "fileName" VARCHAR(180) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "SkillGroup_sortOrder_idx" ON "SkillGroup" ("sortOrder");
CREATE INDEX "Experience_sortOrder_idx" ON "Experience" ("sortOrder");