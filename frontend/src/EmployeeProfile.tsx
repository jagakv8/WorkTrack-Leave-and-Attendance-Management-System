import { useEffect, useState } from 'react'
import api from './api'

type EmployeeProfileData = {
  id: number
  employee_code: string
  first_name: string
  last_name: string
  email: string
  department: string
  designation: string
  role: string
  is_active: boolean
}

function EmployeeProfile() {
  const [profile, setProfile] = useState<EmployeeProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/employees/me/profile')
      .then((response) => setProfile(response.data))
      .catch(() => setError('Unable to load your profile. Please sign in again.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="rounded-xl bg-white p-6 shadow-sm">Loading profile...</div>
  }

  if (error) {
    return <div className="rounded-xl bg-red-50 p-6 text-red-600">{error}</div>
  }

  if (!profile) return null

  const details = [
    { label: 'Employee ID', value: profile.employee_code },
    { label: 'First Name', value: profile.first_name },
    { label: 'Last Name', value: profile.last_name },
    { label: 'Email Address', value: profile.email },
    { label: 'Department', value: profile.department },
    { label: 'Designation', value: profile.designation },
    { label: 'Role', value: profile.role.replace('_', ' ') },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
            {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-sm text-slate-500">{profile.designation}</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
              profile.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {profile.is_active ? 'Active Account' : 'Inactive Account'}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-semibold text-slate-900">Personal & Employment Details</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {details.map((item) => (
            <div key={item.label} className="border-b border-slate-100 pb-3">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-1 font-medium capitalize text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default EmployeeProfile
