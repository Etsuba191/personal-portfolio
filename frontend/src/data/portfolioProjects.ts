export type PortfolioProject = {
  slug: string
  number: string
  title: string
  category: string
  description: string
  technologies: string[]
  overview: string
  problem: string
  approach: string
  solution: string
  features: string[]
  result: string
  reflection: string
  gallery: string[]
  github?: string
  liveDemo?: string
  media?: {
    type: 'image' | 'video'
    src: string
    alt?: string
  }
  details: string
}

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: 'electric-grid-dashboard',
    number: '01',
    title: 'Electric Grid Dashboard',
    category: 'Spatial Decision Support',
    description:
      'A web-based spatial decision-support dashboard developed during my internship at the Space Science and Geospatial Institute (SSGI).',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Leaflet', 'React-Leaflet', 'Node.js', 'Prisma', 'PostgreSQL', 'GeoJSON', 'Mapshaper', 'REST APIs', 'Postman'],
    overview:
      'A web-based spatial decision-support dashboard developed during my internship at the Space Science and Geospatial Institute (SSGI). The system helps users visualize, monitor, filter, and manage Ethiopia\'s electric grid assets through an interactive map and dashboard.',
    problem:
      'Large amounts of electric-grid data were difficult to explore and understand efficiently. Users needed a centralized way to view thousands of grid assets, check their status, analyze information, and identify important alerts.',
    approach:
      'I worked with the Spatial Decision Support team to understand their requirements, prepare the available geospatial data, design the dashboard, develop the system, test it with users, and improve it based on their feedback.',
    solution:
      'I developed an interactive dashboard that combines geospatial visualization, asset information, analytics, alerts, filtering, and user management in one system.',
    features: ['Interactive electric-grid map', '35,000+ grid assets visualization', 'Marker clustering for improved map performance', 'Asset filtering and management', 'Status monitoring', 'Dashboard analytics and charts', 'Alert creation and acknowledgement', 'User management and role-based access control', 'Geospatial data processing and validation'],
    result:
      'The dashboard provided staff with a centralized interface for exploring and managing electric-grid information. User testing helped identify improvements to the alert panel and filtering controls, making the system more practical for their workflow.',
    reflection:
      'This project strengthened my experience in geospatial applications, large-scale data processing, system testing, and user-focused development. It also taught me how to turn real organizational requirements into a practical information system.',
    gallery: [],
    github: 'https://github.com/Etsuba191/electric-grid-dashboard',
    media: {
      type: 'video' as const,
      src: '/projects/electric-grid-dashboard/electric-grid-dashboard-1.mp4',
    },
    details:
      'Project completed during an internship at the Space Science and Geospatial Institute (SSGI).',
  },
  {
    slug: 'hotel-management-system',
    number: '03',
    title: 'Hotel Management System',
    category: 'Full-Stack Web Application',
    description:
      'A full-stack hotel management system developed as our 2026 final-year project at Haramaya University.',
    technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Axios', 'Node.js', 'Express.js', 'Prisma', 'MySQL', 'JWT', 'Role-Based Access Control'],
    overview:
      'A full-stack hotel management system developed as our 2026 final-year project at Haramaya University. The system brings key hotel operations into one centralized platform.',
    problem:
      'Managing hotel operations across separate manual processes can make reservations, room status, payments, inventory, and reporting difficult to coordinate and monitor.',
    approach:
      'Our team analyzed hotel-management requirements and developed the system by connecting the frontend, backend, database, authentication, and different operational modules.',
    solution:
      'We developed a centralized system that supports hotel staff and guests across booking, room management, payments, services, inventory, reporting, and user management.',
    features: ['User authentication', 'Role-based access control', 'Room booking and availability', 'Check-in and check-out', 'Payment management', 'Room-status management', 'Service and maintenance requests', 'Inventory management', 'Reporting', 'Guest management', 'Multiple operational roles'],
    result:
      'The project brought major hotel operations into a single information system and demonstrated how different departments can work with shared data and role-specific functionality.',
    reflection:
      'This project gave me practical experience working on a larger information system with multiple modules, user roles, database relationships, and interconnected workflows. Working collaboratively also strengthened my teamwork and problem-solving skills.',
    gallery: [
      '/projects/hotel-management-system/hotel-management-system-1.png',
      '/projects/hotel-management-system/hotel-management-system-2.jpg',
      '/projects/hotel-management-system/hotel-management-system-3.png',
      '/projects/hotel-management-system/hotel-management-system-4.png',
      '/projects/hotel-management-system/hotel-management-system-5.png',
      '/projects/hotel-management-system/hotel-management-system-6.png',
      '/projects/hotel-management-system/hotel-management-system-7.png',
      '/projects/hotel-management-system/hotel-management-system-8.png',
      '/projects/hotel-management-system/hotel-management-system-9.jpg',
    ],
    media: {
      type: 'image' as const,
      src: '/projects/hotel-management-system/hotel-management-system-1.png',
      alt: 'Hotel Management System dashboard',
    },
    details:
      'Haramaya University Final-Year Project | 2026. Source code is private.',
  },
  {
    slug: 'family-web',
    number: '02',
    title: 'Family Web',
    category: 'Web Application',
    description:
      'A responsive family-focused web application designed to organize family information and provide interactive features for connecting with family members.',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'React', 'Lucide React', 'Vercel'],
    overview:
      'A responsive family-focused web application designed to organize family information and provide interactive features for connecting with family members.',
    problem:
      'Family information and interactions can become difficult to organize when they are spread across different platforms. I wanted to create a simple, centralized interface where users could manage profiles and interact with family-related information.',
    approach:
      'I designed and developed the application independently, focusing on a clean user experience, reusable components, responsive layouts, and clear user workflows.',
    solution:
      'I created a responsive frontend application with profile management interfaces, family-member discovery, favorites, notifications, donations, and account-related screens.',
    features: ['Login and registration interfaces', 'Forgot/reset password flows', 'User profiles', 'Family-member search', 'Add/favorite family members', 'Notifications', 'Donation section', 'Date-of-birth selection', 'Profile picture upload interface', 'Responsive design'],
    result:
      'The application was completed and deployed, providing a responsive and organized interface for family-related information and interactions across different screen sizes.',
    reflection:
      'Building this project independently improved my ability to plan features, create reusable interfaces, solve design problems, and take a project from development to deployment.',
    gallery: [
      '/projects/family-web/family-web-1.jpg',
      '/projects/family-web/family-web-2.jpg',
      '/projects/family-web/family-web-3.jpg',
      '/projects/family-web/family-web-4.jpg',
      '/projects/family-web/family-web-5.jpg',
    ],
    media: {
      type: 'image' as const,
      src: '/projects/family-web/family-web-1.jpg',
      alt: 'Family Web application interface',
    },
    github: 'https://github.com/Etsuba191/family-web-app',
    liveDemo: 'https://family-web-app-o4a5-efzub4udt-etsubdinkenyew-3453s-projects.vercel.app/',
    details:
      'A completed and deployed family-focused web application.',
  },
  {
    slug: 'gibi-gubae-student-registration',
    number: '04',
    title: 'Gibi Gubae Student Registration',
    category: 'Frontend Web Application',
    description:
      'A frontend student registration system and community landing page for the Ethiopian Orthodox Tewahedo Church community at Haramaya University.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    overview:
      'A frontend student registration system designed for the Ethiopian Orthodox Tewahedo Church community at Haramaya University. The project combines a student registration interface with a dedicated landing page introducing the Gibi Gubae community in Haramaya City.',
    problem:
      'Student registration and community information can be difficult to organize when handled through disconnected or manual processes. The project aimed to provide a simple digital interface for registration while making information about the Gibi Gubae community easier to access.',
    approach:
      'I focused on creating a clean, accessible, and easy-to-navigate frontend. The interface was structured around the needs of students while also providing a clear introduction to the Gibi Gubae community.',
    solution:
      'I developed a frontend web application that provides a student registration interface and a dedicated community landing page. The design keeps the registration process straightforward while presenting community information in an organized way.',
    features: ['Student registration interface', 'Community landing page', 'Clean and accessible user interface', 'Structured registration form', 'Responsive web layout', 'Community information section', 'Interactive frontend elements'],
    result:
      'The project provides a simple digital experience for student registration while giving the Gibi Gubae community a dedicated online presence at Haramaya University.',
    reflection:
      'This project helped me practice frontend development while working on a project connected to a real student and community context. It strengthened my understanding of designing clear interfaces, structuring forms, and creating accessible web experiences with HTML, CSS, and JavaScript.',
    gallery: [],
    github: 'https://github.com/Etsuba191/HUGG-Student-Registration-System',
    media: {
      type: 'image' as const,
      src: '/projects/gibi-gubae-student-registration/gibi-gubae-1.jpg',
      alt: 'Gibi Gubae student registration interface',
    },
    details:
      'Frontend web application for student registration and community information.',
  },
].sort((firstProject, secondProject) => Number(firstProject.number) - Number(secondProject.number))

export const getPortfolioProject = (slug: string) =>
  portfolioProjects.find((project) => project.slug === slug)
