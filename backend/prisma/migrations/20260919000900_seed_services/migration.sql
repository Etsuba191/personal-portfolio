UPDATE "AboutContent"
SET "services" = COALESCE("services", '[
  {"number":"01","icon":"</>","title":"Frontend Development","description":"I build responsive, interactive interfaces with React, TypeScript, and modern CSS."},
  {"number":"02","icon":"{}","title":"Backend Development","description":"I develop APIs and server-side applications with Node.js and Express, connecting applications to reliable databases."},
  {"number":"03","icon":"↗","title":"Full-Stack Development","description":"I build complete web applications from the user interface to the backend, API, and database."},
  {"number":"04","icon":"✦","title":"Interactive Web Experiences","description":"I create interactive interfaces, maps, animations, and visual experiences that make products feel useful and alive."}
]'::jsonb)
WHERE "id" = 1;