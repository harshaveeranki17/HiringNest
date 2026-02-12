# 🚀 JobSphere — Full-Stack Job Portal

JobSphere is a modern job portal platform inspired by Naukri and Indeed, built with Next.js 14, TypeScript, Tailwind CSS, and PostgreSQL with Prisma ORM.

## Features

- **Job Seekers**: Browse jobs, create profiles, track applications, save jobs, salary insights
- **Employers**: Post jobs, manage applications, search resumes, company pages
- **Admin**: User management, job moderation, analytics, content management
- **Authentication**: NextAuth.js with email/password, Google, and LinkedIn OAuth
- **Real-time**: Notifications and messaging
- **Payments**: Subscription plans with Razorpay/Stripe

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| State Management | Zustand |
| Backend | Next.js API Routes |
| Database | PostgreSQL with Prisma ORM |
| Authentication | NextAuth.js |
| File Storage | Azure Blob Storage |
| Search | Elasticsearch/Algolia (planned) |
| Real-time | Socket.io (planned) |
| Email | Nodemailer + SendGrid/Resend |
| Payments | Razorpay/Stripe |

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Environment variables configured (see `.env.example`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jobsphere
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your database credentials and API keys.

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. (Optional) Seed the database:
```bash
npx prisma db seed
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
jobsphere/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (seeker)/          # Job seeker pages
│   ├── (employer)/        # Employer pages
│   ├── (admin)/           # Admin panel
│   ├── jobs/              # Public job pages
│   ├── companies/         # Company pages
│   ├── salary/            # Salary insights
│   ├── blog/              # Blog/Career advice
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
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
