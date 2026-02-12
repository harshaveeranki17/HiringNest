# JobSphere Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for PostgreSQL database)
- Git (optional)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start PostgreSQL Database

Make sure Docker Desktop is running, then use Docker Compose to start PostgreSQL:

```bash
docker compose up -d
```

This will start a PostgreSQL database on `localhost:5432` with:
- Username: `postgres`
- Password: `postgres`  
- Database: `jobsphere`

### 3. Set up Environment Variables

The `.env.local` file is already configured with the correct database URL:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobsphere"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production"
```

### 4. Initialize Database

Run Prisma migrations to create the database schema:

```bash
npx prisma db push
```

### 5. (Optional) Seed Database

Create seed data for testing:

```bash
npx prisma db seed
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Prisma Commands

- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate dev` - Create and apply a new migration
- `npx prisma generate` - Regenerate Prisma Client

## Troubleshooting

### PowerShell Script Execution Issues

If you encounter "scripts is disabled" error on Windows, run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

Then run your npm commands in the same PowerShell window.

### Database Connection Issues

1. Ensure Docker Desktop is running
2. Check if PostgreSQL container is running:
   ```bash
   docker ps
   ```
3. If not running, start it:
   ```bash
   docker compose up -d
   ```
4. Verify database connection:
   ```bash
   npx prisma db pull
   ```

### Module Not Found Errors

Clear Next.js cache and reinstall:

```bash
rm -rf .next node_modules
npm install
```

## Project Structure

```
jobsphere/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (seeker)/          # Job seeker pages
│   ├── (employer)/        # Employer pages
│   ├── (admin)/           # Admin panel
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema
├── public/               # Static files
└── types/                # TypeScript types
```

## User Roles

The application supports three user roles:

1. **Job Seekers**: Can browse jobs, apply, create profiles, track applications
2. **Employers**: Can post jobs, manage applications, search resumes
3. **Admins**: Can manage users, moderate content, view analytics

## Features Implemented

### Authentication
- [x] Email/Password login
- [x] Google OAuth
- [x] LinkedIn OAuth (requires API keys)
- [x] Session management with NextAuth.js
- [x] Role-based access control

### Job Seeker Features
- [ ] Browse and search jobs
- [ ] Job application tracking
- [ ] Profile creation
- [ ] Resume upload
- [ ] Saved jobs
- [ ] Job alerts

### Employer Features
- [ ] Post job listings
- [ ] Manage applications
- [ ] Search candidates
- [ ] Company profile pages

### Admin Features
- [ ] User management
- [ ] Job moderation
- [ ] Analytics dashboard
- [ ] Content management

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Jobs
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job (employer only)
- `GET /api/jobs/[id]` - Get job details
- `PUT /api/jobs/[id]` - Update job (employer only)
- `DELETE /api/jobs/[id]` - Delete job (employer only)

### Applications
- `GET /api/applications` - List user's applications
- `POST /api/applications` - Submit job application
- `GET /api/applications/[id]` - Get application details
- `PUT /api/applications/[id]` - Update application status

## Environment Variables

Required environment variables in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobsphere"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# LinkedIn OAuth (optional)
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# Email Service (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# File Storage (optional)
AZURE_STORAGE_CONNECTION_STRING="your-azure-connection-string"
```

## Next Steps

1. **Setup OAuth Providers**: Configure Google and LinkedIn OAuth for social login
2. **Implement Remaining Features**: Complete the TODO features listed above
3. **Add Email Service**: Configure Nodemailer for email notifications
4. **Setup File Storage**: Configure Azure Blob Storage for resume uploads
5. **Add Search**: Integrate Elasticsearch or Algolia for job search
6. **Payment Integration**: Add Razorpay/Stripe for subscriptions

## Support

For issues or questions, please refer to:
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs
- NextAuth.js Documentation: https://next-auth.js.org/

## License

This project is for educational/demo purposes.
