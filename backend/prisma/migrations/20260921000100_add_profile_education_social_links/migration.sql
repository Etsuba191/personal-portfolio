CREATE TABLE "Profile" (
  "id" INTEGER PRIMARY KEY DEFAULT 1,
  "name" TEXT,
  "professionalTitle" TEXT,
  "shortIntroduction" TEXT,
  "location" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Education" (
  "id" SERIAL PRIMARY KEY,
  "institution" VARCHAR(180) NOT NULL,
  "degree" VARCHAR(180) NOT NULL,
  "startDate" VARCHAR(40),
  "endDate" VARCHAR(40),
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "SocialLink" (
  "id" SERIAL PRIMARY KEY,
  "platform" VARCHAR(40) NOT NULL UNIQUE,
  "label" VARCHAR(80) NOT NULL,
  "url" VARCHAR(1000) NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Education_sortOrder_idx" ON "Education" ("sortOrder");
CREATE INDEX "SocialLink_sortOrder_idx" ON "SocialLink" ("sortOrder");

INSERT INTO "Profile" ("id", "name", "professionalTitle", "shortIntroduction", "location", "email", "phone")
VALUES (1, 'Etsubdink Enyew', 'Full-Stack Developer', 'I build digital experiences that solve real problems.', NULL, 'etsubdinkenyew@gmail.com', NULL)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "SocialLink" ("platform", "label", "url", "sortOrder")
VALUES
  ('github', 'GitHub', 'https://github.com/Etsuba191', 1),
  ('linkedin', 'LinkedIn', 'https://www.linkedin.com/in/etsubdink-enyew-a16baa328', 2),
  ('telegram', 'Telegram', 'https://t.me/gabrii19', 3),
  ('instagram', 'Instagram', 'https://www.instagram.com/etsuba_19', 4)
ON CONFLICT ("platform") DO NOTHING;
