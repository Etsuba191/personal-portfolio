CREATE TABLE "Project" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(160) NOT NULL,
  "slug" VARCHAR(180) NOT NULL UNIQUE,
  "category" VARCHAR(120) NOT NULL,
  "shortDescription" VARCHAR(500) NOT NULL,
  "overview" TEXT NOT NULL,
  "problem" TEXT NOT NULL,
  "approach" TEXT NOT NULL,
  "solution" TEXT NOT NULL,
  "technologies" TEXT[] NOT NULL DEFAULT '{}',
  "keyFeatures" TEXT[] NOT NULL DEFAULT '{}',
  "result" TEXT NOT NULL,
  "reflection" TEXT NOT NULL,
  "projectType" VARCHAR(120) NOT NULL,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "githubUrl" TEXT,
  "liveUrl" TEXT,
  "videoUrl" TEXT,
  "coverImage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ProjectImage" (
  "id" SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Project_published_featured_idx" ON "Project" ("published", "featured");
CREATE INDEX "Project_published_updatedAt_idx" ON "Project" ("published", "updatedAt");
CREATE INDEX "ProjectImage_projectId_sortOrder_idx" ON "ProjectImage" ("projectId", "sortOrder");