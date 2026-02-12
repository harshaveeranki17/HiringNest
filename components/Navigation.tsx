// components/Navigation.tsx
'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { HiringNestLogo } from './HiringNestLogo'

export function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <HiringNestLogo size="sm" showText={true} />
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/jobs/search" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Find Jobs
            </Link>
            {session?.user?.role === 'EMPLOYER' && (
              <>
                <Link href="/manage-jobs" className="text-gray-700 hover:text-blue-600 font-medium transition">
                  Manage Jobs
                </Link>
                <Link href="/applicants" className="text-gray-700 hover:text-blue-600 font-medium transition">
                  Applicants
                </Link>
              </>
            )}
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition">
                Admin
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-sm text-gray-600">
                  {session.user?.email}
                </span>
                <Link
                  href="/dashboard"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium transition">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
