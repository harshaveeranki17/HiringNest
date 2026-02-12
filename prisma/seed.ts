import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create test users
  const hashedPassword = await hash('password123', 10)

  // Job Seeker
  const seeker = await prisma.user.upsert({
    where: { email: 'seeker@example.com' },
    update: {},
    create: {
      email: 'seeker@example.com',
      password: hashedPassword,
      role: 'JOB_SEEKER',
      emailVerified: new Date(),
      jobSeekerProfile: {
        create: {
          fullName: 'John Doe',
          headline: 'Full Stack Developer',
          summary: 'Experienced developer with 5+ years in web development',
          experienceYears: 5,
          currentSalary: 800000,
          expectedSalary: 1200000,
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
          isActivelyLooking: true,
        },
      },
    },
  })

  // Create company
  const company = await prisma.company.upsert({
    where: { slug: 'tech-innovations' },
    update: {},
    create: {
      name: 'Tech Innovations Pvt Ltd',
      slug: 'tech-innovations',
      industry: 'Information Technology',
      companySize: '50-200',
      foundedYear: 2015,
      description: 'Leading technology company specializing in web and mobile solutions',
      headquarters: 'Bangalore, India',
      locations: ['Bangalore', 'Mumbai', 'Delhi'],
      isVerified: true,
      rating: 4.5,
      reviewCount: 150,
    },
  })

  // Employer/Recruiter
  const employer = await prisma.user.upsert({
    where: { email: 'recruiter@techinnovations.com' },
    update: {},
    create: {
      email: 'recruiter@techinnovations.com',
      password: hashedPassword,
      role: 'EMPLOYER',
      emailVerified: new Date(),
      recruiterProfile: {
        create: {
          companyId: company.id,
          designation: 'Senior Recruiter',
          department: 'Human Resources',
          isAdmin: true,
        },
      },
    },
  })

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hiringnest.com' },
    update: {},
    create: {
      email: 'admin@hiringnest.com',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  // Create job categories
  const itCategory = await prisma.jobCategory.upsert({
    where: { slug: 'it-software' },
    update: {},
    create: {
      name: 'IT & Software',
      slug: 'it-software',
      icon: '💻',
    },
  })

  const marketingCategory = await prisma.jobCategory.upsert({
    where: { slug: 'sales-marketing' },
    update: {},
    create: {
      name: 'Sales & Marketing',
      slug: 'sales-marketing',
      icon: '📊',
    },
  })

  // Create jobs
  const job1 = await prisma.job.create({
    data: {
      companyId: company.id,
      recruiterId: employer.id,
      title: 'Senior Full Stack Developer',
      slug: 'senior-full-stack-developer-tech-innovations',
      description: 'We are looking for an experienced Full Stack Developer to join our dynamic team.',
      requirements: [
        '5+ years of experience in web development',
        'Strong knowledge of React, Node.js, and TypeScript',
        'Experience with PostgreSQL or similar databases',
        'Good understanding of REST APIs and microservices',
      ],
      responsibilities: [
        'Develop and maintain web applications',
        'Collaborate with cross-functional teams',
        'Write clean, maintainable code',
        'Participate in code reviews',
      ],
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
      jobType: 'FULL_TIME',
      workMode: 'HYBRID',
      experienceMin: 5,
      experienceMax: 8,
      salaryMin: 1200000,
      salaryMax: 1800000,
      currency: 'INR',
      location: 'Bangalore, Karnataka',
      vacancies: 2,
      status: 'ACTIVE',
      categoryId: itCategory.id,
      isFeatured: true,
      isUrgent: false,
    },
  })

  const job2 = await prisma.job.create({
    data: {
      companyId: company.id,
      recruiterId: employer.id,
      title: 'Frontend Developer (React)',
      slug: 'frontend-developer-react-tech-innovations',
      description: 'Join our team as a Frontend Developer specializing in React.',
      requirements: [
        '3+ years of React experience',
        'Strong HTML, CSS, JavaScript skills',
        'Experience with state management (Redux/Zustand)',
        'Knowledge of responsive design',
      ],
      responsibilities: [
        'Build responsive user interfaces',
        'Optimize applications for performance',
        'Collaborate with designers and backend developers',
        'Write unit and integration tests',
      ],
      skills: ['React', 'JavaScript', 'CSS', 'Redux', 'Tailwind CSS'],
      jobType: 'FULL_TIME',
      workMode: 'REMOTE',
      experienceMin: 3,
      experienceMax: 6,
      salaryMin: 800000,
      salaryMax: 1400000,
      currency: 'INR',
      location: 'Remote',
      vacancies: 3,
      status: 'ACTIVE',
      categoryId: itCategory.id,
      isFeatured: false,
      isUrgent: true,
    },
  })

  const job3 = await prisma.job.create({
    data: {
      companyId: company.id,
      recruiterId: employer.id,
      title: 'Digital Marketing Manager',
      slug: 'digital-marketing-manager-tech-innovations',
      description: 'Seeking an experienced Digital Marketing Manager to lead our marketing initiatives.',
      requirements: [
        '4+ years in digital marketing',
        'Experience with SEO, SEM, and social media marketing',
        'Strong analytical skills',
        'Excellent communication skills',
      ],
      responsibilities: [
        'Develop and execute marketing strategies',
        'Manage social media campaigns',
        'Analyze marketing metrics and ROI',
        'Lead a team of marketing professionals',
      ],
      skills: ['SEO', 'SEM', 'Social Media Marketing', 'Google Analytics', 'Content Marketing'],
      jobType: 'FULL_TIME',
      workMode: 'HYBRID',
      experienceMin: 4,
      experienceMax: 7,
      salaryMin: 1000000,
      salaryMax: 1600000,
      currency: 'INR',
      location: 'Mumbai, Maharashtra',
      vacancies: 1,
      status: 'ACTIVE',
      categoryId: marketingCategory.id,
      isFeatured: true,
      isUrgent: false,
    },
  })

  console.log('Seed data created successfully!')
  console.log('\nTest Accounts:')
  console.log('Job Seeker: seeker@example.com / password123')
  console.log('Employer: recruiter@techinnovations.com / password123')
  console.log('Admin: admin@hiringnest.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
