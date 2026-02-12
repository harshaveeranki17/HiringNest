'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HiringNestLogo } from '@/components/HiringNestLogo'

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <HiringNestLogo size="sm" showText={true} />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/jobs/search" className="text-gray-700 hover:text-blue-600">
                Find Jobs
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Find Your Dream Job
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              HiringNest connects you with top employers across India. Search thousands of jobs, apply with ease, and track your applications in one place.
            </p>
            
            {/* Search Bar */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                className="w-full sm:w-96 rounded-md border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600"
              />
              <input
                type="text"
                placeholder="Location"
                className="w-full sm:w-64 rounded-md border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600"
              />
              <button 
                onClick={() => router.push('/jobs/search')}
                className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                Search Jobs
              </button>
            </div>
          </div>
        </section>

        {/* Features/Categories Section */}
        <section className="bg-white px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center mb-12">
              Popular Job Categories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {['IT & Software', 'Sales & Marketing', 'Healthcare', 'Finance', 'Education', 'Design', 'Engineering', 'HR'].map((category) => (
                <div
                  key={category}
                  className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                  <p className="mt-2 text-sm text-gray-500">1000+ jobs</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 px-6 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to find your next opportunity?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of job seekers and employers on HiringNest
            </p>
            <div className="mt-8 flex gap-4 justify-center">
              <button className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50">
                Get Started
              </button>
              <button className="rounded-md border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500">
                For Employers
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-white">Job Seekers</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Browse Jobs</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Career Advice</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Salary Tool</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Employers</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Post a Job</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Search Resumes</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">&copy; 2026 HiringNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
