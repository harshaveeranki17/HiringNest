# 🚀 HiringNest — Full-Stack Job Portal Platform

[![GitHub](https://img.shields.io/badge/GitHub-harshaveeranki17%2FHiringNest-blue?logo=github)](https://github.com/harshaveeranki17/HiringNest)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5.20-2D3748?logo=prisma)

A modern, full-stack job portal platform that connects job seekers with employers. Built with Next.js 16, TypeScript, Tailwind CSS, PostgreSQL, and NextAuth.js.

🔗 **Live Repository**: [github.com/harshaveeranki17/HiringNest](https://github.com/harshaveeranki17/HiringNest)

## ✨ Features

### 👤 Job Seekers
- Browse and search job listings
- Advanced filtering (location, job type, salary range)
- Create and manage professional profiles
- Apply to jobs with resume
- Track application status in real-time
- Save favorite jobs
- Salary insights and market research
- Job alerts and notifications

### 💼 Employers
- Post and manage job listings
- Review and manage applications
- Search candidate resumes
- Company profile pages
- Candidate communication
- Application workflow management

### 🔐 Authentication
- Email/Password login and registration
- Google OAuth integration
- LinkedIn OAuth (configured)
- Role-based access control (Job Seeker, Employer, Admin)
- Secure session management with NextAuth.js
- Password hashing with bcryptjs

### 🛠️ Admin Panel
- User management and moderation
- Job listing moderation
- Company verification
- Analytics and statistics
- Content management

## 🎨 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 16.1.6 (App Router + Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4, Framer Motion |
| **State Management** | Zustand 5, React Query |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL 15 with Prisma ORM 5.20 |
| **Authentication** | NextAuth.js 4.24 |
| **Forms** | React Hook Form + Zod Validation |
| **Icons** | Lucide React |
| **Email** | Nodemailer (configured) |
| **Payments** | Razorpay/Stripe (planned) |
| **Search** | Elasticsearch/Algolia (planned) |
| **Real-time** | Socket.io (planned) |
| **File Storage** | Azure Blob Storage (planned) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 15+ (or use Docker)
- Git

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/harshaveeranki17/JobSphere.git
cd JobSphere
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobsphere"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Set up PostgreSQL Database**:

**Option A: Using Docker (Recommended)**
```bash
docker compose up -d
npx prisma db push
npm install ts-node --save-dev
npx prisma db seed
```

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL from postgresql.org
# Create database
createdb jobsphere

# Push schema
npx prisma db push

# Seed data
npx prisma db seed
```

5. **Start development server**:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📚 Available Routes

### Public Routes
- `/` - Homepage
- `/jobs/search` - Job search and browsing
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset

### Protected Routes (Job Seeker)
- `/dashboard` - Dashboard
- `/seeker/profile` - User profile
- `/seeker/applications` - Application tracking
- `/seeker/saved-jobs` - Saved jobs list
- `/seeker/settings` - Settings

### Protected Routes (Employer)
- `/employer/post-job` - Create job posting
- `/employer/manage-jobs` - Manage job listings
- `/employer/applicants` - View applicants
- `/employer/search-resumes` - Candidate search
- `/employer/settings` - Settings

### Protected Routes (Admin)
- `/admin/users` - User management
- `/admin/jobs` - Job moderation
- `/admin/companies` - Company management
- `/admin/dashboard` - Analytics

## 📊 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints
- `POST /api/auth/register` - User registration

### Jobs
- `GET /api/jobs` - List jobs (with search/filter)
- `POST /api/jobs` - Create job (employer only)

### Applications
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Submit application

## 🗂️ Project Structure

```
JobSphere/
├── app/                           # Next.js App Router
│   ├── (auth)/                   # Auth routes (layout route group)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (seeker)/                 # Job seeker routes
│   │   ├── profile/
│   │   ├── applications/
│   │   ├── saved-jobs/
│   │   └── settings/
│   ├── (employer)/               # Employer routes
│   │   ├── post-job/
│   │   ├── manage-jobs/
│   │   ├── applicants/
│   │   └── search-resumes/
│   ├── (admin)/                  # Admin routes
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── users/
│   │   └── companies/
│   ├── dashboard/page.tsx
│   ├── jobs/search/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/                    # React components
│   ├── providers.tsx             # NextAuth provider
│   ├── common/
│   ├── forms/
│   ├── layout/
│   └── ui/
├── lib/                           # Utilities & config
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client
│   ├── constants.ts
│   ├── utils.ts
│   └── validations/
├── types/                         # TypeScript types
│   └── next-auth.d.ts            # NextAuth type extensions
├── prisma/                        # Database
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Database seeding
│   └── migrations/
├── public/                        # Static assets
├── styles/                        # Global styles
├── .env.example                   # Environment template
├── docker-compose.yml             # Docker setup
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup and installation guide
- **[TESTING.md](./TESTING.md)** - Feature testing guide and API documentation
- **[RESOLUTION.md](./RESOLUTION.md)** - Resolution summary and troubleshooting

## 💾 Database Schema

The database includes 16 models:
- **User** - User accounts with roles
- **Account** - OAuth account linking
- **Session** - NextAuth sessions
- **JobSeekerProfile** - Seeker information
- **RecruiterProfile** - Employer information
- **Company** - Company details
- **Job** - Job listings
- **Application** - Job applications
- **Notification** - User notifications
- **Message** - Direct messaging
- **SavedJob** - Bookmarked jobs
- **SavedCandidate** - Bookmarked candidates
- And more...

## 🔄 Development Workflow

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Check TypeScript
npx tsc --noEmit

# Manage database
npx prisma studio              # Open database GUI
npx prisma db push             # Push schema changes
npx prisma db seed             # Run seeders
npx prisma generate            # Regenerate client
```

## 🔐 Demo Credentials (After Seeding)

```
Admin Account:
  Email: admin@jobsphere.com
  Password: admin123

Employer Account:
  Email: employer@techcorp.com
  Password: employer123

Job Seeker Account:
  Email: seeker@example.com
  Password: seeker123
```

## 🚦 Current Status

| Feature | Status |
|---------|--------|
| ✅ Authentication | Complete |
| ✅ Frontend Pages | Complete |
| ✅ API Routes | Complete |
| ✅ Database Schema | Complete |
| ✅ Routing | Complete |
| ✅ Deployment Ready | Yes |
| ⏳ Database Setup | Needs PostgreSQL |
| ⏳ Email Service | Needs SMTP config |
| ⏳ OAuth Keys | Optional |
| 🔲 Real-time Features | Planned |
| 🔲 Search Engine | Planned |
| 🔲 Payment Processing | Planned |

## 🔧 Next Steps

### For Development
1. Set up PostgreSQL database
2. Configure OAuth providers (Google, LinkedIn)
3. Set up email service (SMTP)
4. Configure file storage (Azure/AWS)
5. Add error tracking (Sentry)
6. Add analytics (Google Analytics)

### For Production
1. Deploy to Vercel/Railway
2. Configure production database
3. Set up SSL/HTTPS
4. Configure domain
5. Set up CI/CD pipeline
6. Monitor and optimize performance

## 🐛 Known Issues & Limitations

- SQLite not supported (PostgreSQL required)
- Real-time messaging not yet implemented
- File uploads require Azure/AWS setup
- Email notifications need SMTP configuration
- Search functionality uses basic filtering (full-text search planned)

## 📝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👥 Author

**Harsha Veeranki**
- GitHub: [@harshaveeranki17](https://github.com/harshaveeranki17)
- Email: harsha@example.com

## 🙋 Support

For issues, questions, or suggestions:
1. Check the documentation files (SETUP.md, TESTING.md)
2. Open a GitHub issue
3. Review existing issues for similar problems

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database with [Prisma](https://www.prisma.io/)
- Authentication with [NextAuth.js](https://next-auth.js.org/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Inspired by Naukri and Indeed

---

**Repository**: [github.com/harshaveeranki17/JobSphere](https://github.com/harshaveeranki17/JobSphere)  
**Last Updated**: February 12, 2026
│   ├── forms/            # Form components
│   ├── jobs/             # Job-related components
│   └── ...
├── lib/                  # Utility functions
│   ├── prisma.ts        # Prisma client
│   ├── utils.ts         # Helper functions
│   ├── constants.ts     # Constants
│   └── validations/     # Zod schemas
├── hooks/                # Custom React hooks
├── store/                # Zustand stores
├── services/             # API service functions
├── types/                # TypeScript types
├── prisma/               # Prisma schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── public/               # Static assets
├── styles/               # Global styles
└── config/               # App configuration
```

## Database Schema

The application uses a normalized PostgreSQL database with the following main entities:

- **Users & Auth**: User, Account, Session, VerificationToken
- **Job Seeker Profile**: JobSeekerProfile, Skill, Resume, Education, WorkExperience, Certification, Project
- **Company & Recruiter**: Company, RecruiterProfile, CompanyLocation
- **Jobs**: Job, JobCategory, JobTag, JobSkill
- **Applications**: Application, ApplicationStatusHistory
- **Interactions**: SavedJob, SavedCandidate, JobAlert, Notification, Review
- **Messaging**: Conversation, ConversationParticipant, Message
- **Admin**: ReportedContent, AuditLog, Subscription

## API Routes

API routes are organized under `/app/api/`:

- `/api/auth/*` - NextAuth.js authentication
- `/api/jobs/*` - Job CRUD operations
- `/api/applications/*` - Application management
- `/api/users/*` - User management
- `/api/companies/*` - Company management
- `/api/messages/*` - Messaging
- `/api/notifications/*` - Notifications
- `/api/payments/*` - Payment processing
- `/api/admin/*` - Admin operations

## Contributing

This is a demonstration project. Contributions are welcome for learning and improvement purposes.

## License

This project is for educational and portfolio purposes.

---

**JobSphere** — Your Career, Your Sphere 🌐
