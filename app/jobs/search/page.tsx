'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  slug: string
  company: {
    name: string
    logo: string | null
  }
  location: string | null
  jobType: string
  salaryMin: number | null
  salaryMax: number | null
  postedAt: string
}

export default function JobSearchPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch(`/api/jobs?search=${search}&location=${location}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchJobs()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Jobs</h1>
          
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-md border-0 px-4 py-2 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full sm:w-64 rounded-md border-0 px-4 py-2 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600"
            />
            <button
              onClick={handleSearch}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No jobs found. Try adjusting your search criteria.</p>
            <p className="mt-2 text-sm text-gray-400">
              Database connection required for live job listings.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.slug}`}
                className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                    <p className="mt-1 text-sm text-gray-600">{job.company.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                      {job.location && <span>📍 {job.location}</span>}
                      <span>💼 {job.jobType.replace('_', ' ')}</span>
                      {job.salaryMin && job.salaryMax && (
                        <span>💰 ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 text-right text-sm text-gray-500">
                    {new Date(job.postedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
