import { useEffect, useState } from 'react'
import api from './api'

type Employee = {
  id: number
  employee_code: string
  first_name: string
  last_name: string
  email: string
  department: string | null
  designation: string | null
  role: string
  is_active: boolean
}

function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [resetEmployeeId, setResetEmployeeId] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [form, setForm] = useState({
    employee_code: '',
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    designation: '',
    temporary_password: '',
  })

  useEffect(() => {
    api.get('/employees/')
      .then((response) => setEmployees(response.data))
      .catch(() => setError('Unable to load employees. Please check your login and backend.'))
      .finally(() => setLoading(false))
  }, [])

  async function toggleEmployeeStatus(employee: Employee) {
    const action = employee.is_active ? 'deactivate' : 'activate'

    if (!window.confirm(`Are you sure you want to ${action} ${employee.first_name} ${employee.last_name}?`)) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const response = await api.patch(`/employees/${employee.id}/${action}`)
      setEmployees((previous) =>
        previous.map((item) => item.id === employee.id ? response.data : item)
      )
      setSuccess(`Employee ${action}d successfully.`)
    } catch (err: any) {
      setError(err.response?.data?.detail || `Unable to ${action} employee.`)
    }
  }

  function startEditing(employee: Employee) {
    setEditingId(employee.id)
    setForm({
      employee_code: employee.employee_code,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      department: employee.department || '',
      designation: employee.designation || '',
      temporary_password: '',
    })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  async function handleUpdateEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (editingId === null) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await api.put(`/employees/${editingId}`, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        department: form.department || null,
        designation: form.designation || null,
      })

      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === editingId ? response.data : employee
        )
      )

      setEditingId(null)
      setShowForm(false)
      setSuccess('Employee updated successfully.')
      setForm({
        employee_code: '',
        first_name: '',
        last_name: '',
        email: '',
        department: '',
        designation: '',
        temporary_password: '',
      })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to update employee.')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await api.post('/employees/', {
        ...form,
        temporary_password: form.temporary_password,
      })
      setEmployees((previous) => [...previous, response.data])
      setForm({
        employee_code: '',
        first_name: '',
        last_name: '',
        email: '',
        department: '',
        designation: '',
        temporary_password: '',
      })
      setShowForm(false)
      setSuccess('Employee created successfully.')
    } catch {
      setError('Unable to create employee. Check whether the employee code or email already exists.')
    } finally {
      setSaving(false)
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (resetEmployeeId === null) return

    setError('')
    setSuccess('')

    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSaving(true)

    try {
      const response = await api.post(
        `/auth/reset-password/${resetEmployeeId}`,
        { new_password: newPassword }
      )

      setSuccess(response.data.message || 'Employee password reset successfully.')
      setResetEmployeeId(null)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to reset employee password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="mt-1 text-sm text-slate-500">View and manage your workforce.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            {employees.length} employees
          </span>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              setForm({ employee_code: '', first_name: '', last_name: '', email: '', department: '', designation: '', temporary_password: '' })
              setError('')
              setSuccess('')
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Employee'}
          </button>
        </div>
      </div>

      {success && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {showForm && (
        <form onSubmit={editingId !== null ? handleUpdateEmployee : handleCreateEmployee} className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold">{editingId !== null ? 'Edit Employee' : 'Add New Employee'}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {([
              ['employee_code', 'Employee Code'],
              ['first_name', 'First Name'],
              ['last_name', 'Last Name'],
              ['email', 'Email Address'],
              ['department', 'Department'],
              ['designation', 'Designation'],
            ] as const).map(([key, label]) => (
              <div key={key}>
                <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
                <input
                  required={key !== 'department' && key !== 'designation'}
                  disabled={editingId !== null && key === 'employee_code'}
                  type={key === 'email' ? 'email' : 'text'}
                  value={form[key]}
                  onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
                  placeholder={label}
                />
              </div>
            ))}
          </div>

          {editingId === null && (
            <div className="mt-4 max-w-md">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Temporary Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                maxLength={128}
                value={form.temporary_password}
                onChange={(event) =>
                  setForm({ ...form, temporary_password: event.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
                placeholder="Enter temporary password (minimum 8 characters)"
              />
              <p className="mt-1 text-xs text-slate-500">
                Share this temporary password securely with the employee.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : editingId !== null ? 'Save Changes' : 'Create Employee'}
          </button>
        </form>
      )}

      {resetEmployeeId !== null && (
        <form onSubmit={handleResetPassword} className="mb-6 rounded-xl border border-purple-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Reset Employee Password</h3>
          <p className="mt-1 text-sm text-slate-500">
            Employee: {employees.find((item) => item.id === resetEmployeeId)?.first_name}{' '}
            {employees.find((item) => item.id === resetEmployeeId)?.last_name}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">New Password</label>
              <input
                type="password"
                required
                minLength={8}
                maxLength={128}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {saving ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setResetEmployeeId(null)
                setNewPassword('')
                setConfirmPassword('')
                setError('')
              }}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading employees...</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-600">{error}</p>
        ) : employees.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No employees found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Designation</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {employee.first_name} {employee.last_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {employee.employee_code} · {employee.email}
                      </p>
                    </td>
                    <td className="px-5 py-4">{employee.department || '—'}</td>
                    <td className="px-5 py-4">{employee.designation || '—'}</td>
                    <td className="px-5 py-4 capitalize">{employee.role.replace('_', ' ')}</td>
                    <td className="px-5 py-4">
                      <span className={employee.is_active
                        ? 'rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700'
                        : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600'
                      }>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => startEditing(employee)}
                        className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleEmployeeStatus(employee)}
                        className={`ml-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                          employee.is_active
                            ? 'border-red-200 text-red-700 hover:bg-red-50'
                            : 'border-green-200 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {employee.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          setResetEmployeeId(employee.id)
                          setNewPassword('')
                          setConfirmPassword('')
                          setError('')
                          setSuccess('')
                        }}
                        className="ml-2 rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default Employees
