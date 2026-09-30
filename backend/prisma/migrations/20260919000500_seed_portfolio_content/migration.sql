INSERT INTO "AboutContent" ("id", "heading", "paragraphs")
VALUES (
  1,
  'Building with purpose.',
  ARRAY[
    'I''m a Full-Stack Developer and an Information Science graduate from Haramaya University. I enjoy building web applications that are not only technically functional, but also easy and enjoyable to use.',
    'My experience comes from working on real projects, internships, and personal applications across frontend and backend development. I''m particularly interested in turning ideas into practical digital products and continuously improving my skills as a developer.\n\nI believe good software is about more than writing code — it''s about understanding the problem and building something that genuinely helps people.'
  ]
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "SkillGroup" ("title", "skills", "sortOrder")
SELECT 'Frontend', ARRAY['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Responsive UI'], 1
WHERE NOT EXISTS (SELECT 1 FROM "SkillGroup" WHERE "title" = 'Frontend');

INSERT INTO "SkillGroup" ("title", "skills", "sortOrder")
SELECT 'Backend', ARRAY['Node.js', 'Express', 'Prisma', 'REST APIs', 'MySQL', 'PostgreSQL'], 2
WHERE NOT EXISTS (SELECT 1 FROM "SkillGroup" WHERE "title" = 'Backend');

INSERT INTO "SkillGroup" ("title", "skills", "sortOrder")
SELECT 'Tools', ARRAY['Git', 'GitHub', 'Leaflet', 'API Design', 'Problem Solving'], 3
WHERE NOT EXISTS (SELECT 1 FROM "SkillGroup" WHERE "title" = 'Tools');

INSERT INTO "Experience" ("organization", "role", "division", "startDate", "endDate", "description", "sortOrder")
SELECT 'Space Science and Geospatial Institute', 'Web Development Intern', 'Spatial Decision Support Division', 'July 2025', 'September 2025', NULL, 1
WHERE NOT EXISTS (
  SELECT 1 FROM "Experience" WHERE "organization" = 'Space Science and Geospatial Institute' AND "role" = 'Web Development Intern'
);
