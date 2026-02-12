export const APP_NAME = 'JobSphere'
export const APP_DESCRIPTION = 'Find Your Dream Job | Indias Smartest Job Portal'

export const JOB_TYPES = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
} as const

export const WORK_MODES = {
  REMOTE: 'Remote',
  ONSITE: 'On-site',
  HYBRID: 'Hybrid',
} as const

export const APPLICATION_STATUS = {
  APPLIED: 'Applied',
  VIEWED: 'Viewed',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  OFFERED: 'Offered',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
} as const

export const USER_ROLES = {
  JOB_SEEKER: 'Job Seeker',
  EMPLOYER: 'Employer',
  ADMIN: 'Admin',
} as const

export const EXPERIENCE_LEVELS = [
  { label: 'Fresher', value: '0-1' },
  { label: '1-3 years', value: '1-3' },
  { label: '3-5 years', value: '3-5' },
  { label: '5-10 years', value: '5-10' },
  { label: '10+ years', value: '10+' },
]

export const DATE_POSTED_OPTIONS = [
  { label: 'Last 24 hours', value: '1' },
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 14 days', value: '14' },
  { label: 'Last 30 days', value: '30' },
]
