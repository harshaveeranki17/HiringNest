'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userRole = (session.user as any)?.role || 'JOB_SEEKER'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {session.user?.email}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {userRole === 'JOB_SEEKER' && (
            <>
              <DashboardCard
                title="Browse Jobs"
                description="Find your next opportunity"
                link="/jobs/search"
                icon="🔍"
              />
              <DashboardCard
                title="My Applications"
                description="Track your job applications"
                link="/seeker/applications"
                icon="📄"
              />
              <DashboardCard
                title="My Profile"
                description="Update your profile"
                link="/seeker/profile"
                icon="👤"
              />
              <DashboardCard
                title="Saved Jobs"
                description="View your saved jobs"
                link="/seeker/saved-jobs"
                icon="⭐"
              />
            </>
          )}

          {userRole === 'EMPLOYER' && (
            <>
              <DashboardCard
                title="Post a Job"
                description="Create new job listing"
                link="/employer/post-job"
                icon="➕"
              />
              <DashboardCard
                title="Manage Jobs"
                description="View and edit your jobs"
                link="/employer/manage-jobs"
                icon="📋"
              />
              <DashboardCard
                title="Applicants"
                description="Review applications"
                link="/employer/applicants"
                icon="👥"
              />
              <DashboardCard
                title="Search Resumes"
                description="Find candidates"
                link="/employer/search-resumes"
                icon="🔍"
              />
            </>
          )}

          {userRole === 'ADMIN' && (
            <>
              <DashboardCard
                title="User Management"
                description="Manage all users"
                link="/admin/users"
                icon="👥"
              />
              <DashboardCard
                title="Job Moderation"
                description="Review and moderate jobs"
                link="/admin/jobs"
                icon="📋"
              />
              <DashboardCard
                title="Companies"
                description="Manage companies"
                link="/admin/companies"
                icon="🏢"
              />
              <DashboardCard
                title="Analytics"
                description="View platform statistics"
                link="/admin/dashboard"
                icon="📊"
              />
            </>
          )}

          <DashboardCard
            title="Settings"
            description="Update your preferences"
            link="/settings"
            icon="⚙️"
          />
        </div>
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  description,
  link,
  icon,
}: {
  title: string
  description: string
  link: string
  icon: string
}) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(link)}
      className="rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </button>
  )
}
