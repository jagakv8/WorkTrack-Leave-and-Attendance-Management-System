import { useEffect, useState } from 'react'
import api from './api'
import Employees from './Employees'
import Attendance from './Attendance'
import EmployeeAttendance from './EmployeeAttendance'
import EmployeeLeaves from './EmployeeLeaves'
import ManagerApprovals from './ManagerApprovals'
import HRApprovals from './HRApprovals'
import { HRLeaveRequests, HRLeaveBalances, HRSettings } from './HRManagement'
import EmployeeProfile from './EmployeeProfile'
import ChangePassword from './ChangePassword'
import './index.css'

type DashboardData = {
  total_employees: number
  present_today: number
  absent_today: number
  pending_leave_requests: number
  approved_leave_requests: number
  attendance_percentage: number
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'))
  const [role, setRole] = useState(localStorage.getItem('user_role'))
  const [employeePage, setEmployeePage] = useState('attendance')
  const [mustChangePassword, setMustChangePassword] = useState(
    localStorage.getItem('must_change_password') === 'true'
  )
  const [activePage, setActivePage] = useState('dashboard')
  const [email, setEmail] = useState('hr@example.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [dashboardError, setDashboardError] = useState('')

  async function loadDashboard() {
    setDashboardError('')
    try {
      const response = await api.get('/dashboard/hr')
      setDashboard(response.data)
    } catch {
      setDashboardError('Unable to load dashboard data. Please sign in again.')
    }
  }

  useEffect(() => {
    if (!token || role !== 'hr_admin') return
    loadDashboard()
  }, [token, role])

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      const userRole = response.data.role

      if (!['hr_admin', 'employee', 'manager'].includes(userRole)) {
        setError('This portal currently supports HR administrators, managers and employees.')
        return
      }

      const passwordChangeRequired = Boolean(response.data.must_change_password)

      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('user_role', userRole)
      localStorage.setItem('must_change_password', String(passwordChangeRequired))
      setToken(response.data.access_token)
      setRole(userRole)
      setMustChangePassword(passwordChangeRequired)
      setEmployeePage(passwordChangeRequired ? 'password' : 'attendance')
      setActivePage(userRole === 'hr_admin' ? 'dashboard' : 'attendance')
      setDashboard(null)
      setDashboardError('')
    } catch {
      setError('Login failed. Please check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('must_change_password')
    setMustChangePassword(false)
    setToken(null)
    setRole(null)
    setDashboard(null)
    setDashboardError('')
    setPassword('')
    setEmail('hr@example.com')
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white">W</div>
            <h1 className="text-2xl font-bold text-slate-900">WorkTrack</h1>
            <p className="mt-2 text-sm text-slate-500">Leave & Attendance Management Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Email address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500" placeholder="Enter your work email" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500" placeholder="Enter your password" />
            </div>
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-400">Leave & Attendance Management System</p>
        </div>
      </main>
    )
  }

  if (role === 'manager') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800">
        <header className="flex items-center justify-between bg-slate-900 px-6 py-5 text-white">
          <div>
            <h1 className="text-xl font-bold">WorkTrack</h1>
            <p className="text-xs text-slate-300">Manager Portal</p>
          </div>
          <button onClick={handleLogout} className="rounded-lg border border-slate-600 px-4 py-2 text-sm">
            Logout
          </button>
        </header>
        <main className="mx-auto max-w-6xl space-y-6 p-5 md:p-10">
          <div>
            <h2 className="text-2xl font-bold">Manager Workspace</h2>
            <p className="mt-1 text-sm text-slate-500">Review and process employee leave requests.</p>
          </div>
          <ManagerApprovals />
        </main>
      </div>
    )
  }

  if (role === 'employee') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800">
        <header className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 px-6 py-5 text-white">
          <div>
            <h1 className="text-xl font-bold">WorkTrack</h1>
            <p className="text-xs text-slate-300">Employee Portal</p>
          </div>
          <button onClick={handleLogout} className="rounded-lg border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800">Logout</button>
        </header>
        <main className="mx-auto max-w-6xl p-5 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">My Workspace</h2>
            <p className="mt-1 text-sm text-slate-500">Manage your attendance and leave requests.</p>
          </div>
          {mustChangePassword && (
            <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-800">
              Please change your temporary password before accessing your workspace.
            </div>
          )}
          <div className="mb-6 flex flex-wrap gap-3">
            {!mustChangePassword && (
              <>
                <button onClick={() => setEmployeePage('attendance')}
                  className={`rounded-lg px-5 py-3 font-medium ${employeePage === 'attendance' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border'}`}>
                  My Attendance
                </button>
                <button onClick={() => setEmployeePage('leaves')}
                  className={`rounded-lg px-5 py-3 font-medium ${employeePage === 'leaves' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border'}`}>
                  My Leaves
                </button>
                <button onClick={() => setEmployeePage('profile')}
                  className={`rounded-lg px-5 py-3 font-medium ${employeePage === 'profile' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border'}`}>
                  My Profile
                </button>
              </>
            )}
            <button onClick={() => setEmployeePage('password')}
              className={`rounded-lg px-5 py-3 font-medium ${employeePage === 'password' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border'}`}>
              Change Password
            </button>
          </div>
          {employeePage === 'attendance' ? <EmployeeAttendance /> :
            employeePage === 'leaves' ? <EmployeeLeaves /> :
            employeePage === 'profile' ? <EmployeeProfile /> : (
              <ChangePassword
                onPasswordChanged={() => {
                  localStorage.setItem('must_change_password', 'false')
                  setMustChangePassword(false)
                  setEmployeePage('attendance')
                }}
              />
            )}
        </main>
      </div>
    )
  }

  if (role !== 'hr_admin') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="text-red-600">Unsupported account role. Please sign out.</p>
          <button onClick={handleLogout} className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-white">Sign out</button>
        </div>
      </main>
    )
  }

  if (dashboardError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="text-red-600">{dashboardError}</p>
          <button onClick={handleLogout} className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-white">Sign out</button>
        </div>
      </main>
    )
  }

  if (!dashboard) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">Loading HR dashboard...</main>
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-slate-900 p-6 text-white md:block">
        <h1 className="text-xl font-bold">WorkTrack</h1>
        <p className="mb-10 mt-1 text-xs text-slate-400">Leave & Attendance</p>
        <nav className="space-y-3 text-sm">
          <button onClick={() => setActivePage('dashboard')} className={`w-full rounded-lg px-4 py-3 text-left font-medium ${activePage === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>Dashboard</button>
          <button onClick={() => setActivePage('attendance')} className={`w-full rounded-lg px-4 py-3 text-left font-medium ${activePage === 'attendance' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>Attendance</button>
          <button onClick={() => setActivePage('leave-requests')} className={`w-full rounded-lg px-4 py-3 text-left font-medium ${activePage === 'leave-requests' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>Leave Requests</button>
          <button onClick={() => setActivePage('leave-balances')} className={`w-full rounded-lg px-4 py-3 text-left font-medium ${activePage === 'leave-balances' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>My Leave Balance</button>
          <button onClick={() => setActivePage('approvals')} className={`w-full rounded-lg px-4 py-3 text-left font-medium ${activePage === 'approvals' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>Approvals</button>
          <button
            onClick={() => setActivePage('reports')}
            className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
              activePage === 'reports'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Reports
          </button>
          <button onClick={() => setActivePage('employees')} className={`w-full rounded-lg px-4 py-3 text-left font-medium ${activePage === 'employees' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>Employees</button>
          <button onClick={() => setActivePage('settings')} className={`w-full rounded-lg px-4 py-3 text-left font-medium ${activePage === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>Settings</button>
        </nav>
      </aside>

      <main className="p-5 md:ml-64 md:p-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{activePage === 'dashboard' ? 'Dashboard' : activePage === 'employees' ? 'Employees' : activePage === 'approvals' ? 'Leave Approvals' : activePage === 'leave-requests' ? 'Leave Requests' : activePage === 'leave-balances' ? 'Employee Leave Balances' : activePage === 'settings' ? 'Settings' : activePage === 'reports' ? 'Attendance Reports' : 'Attendance'}</h2>
            <p className="mt-1 text-sm text-slate-500">Welcome back! Here's your workforce overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">HR Administrator</span>
            <button
              onClick={loadDashboard}
              className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              Refresh Dashboard
            </button>
            <button onClick={handleLogout} className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-slate-50">Logout</button>
          </div>
        </header>

        {activePage === 'approvals' ? <HRApprovals /> : activePage === 'leave-requests' ? <HRLeaveRequests /> : activePage === 'leave-balances' ? <HRLeaveBalances /> : activePage === 'settings' ? <HRSettings /> : activePage === 'employees' ? <Employees /> : (activePage === 'attendance' || activePage === 'reports') ? <Attendance /> : (
          <>
            <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Total Employees" value={dashboard.total_employees} note="Active employees" />
              <StatCard title="Present Today" value={dashboard.present_today} note="Checked in today" />
              <StatCard title="Absent Today" value={dashboard.absent_today} note="No check-in recorded" />
              <StatCard title="Pending Leaves" value={dashboard.pending_leave_requests} note="Awaiting approval" />
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Attendance Overview</h3>
                <p className="mt-2 text-sm text-slate-500">Today's attendance percentage</p>
                <p className="mt-5 text-4xl font-bold text-blue-600">{dashboard.attendance_percentage}%</p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${dashboard.attendance_percentage}%` }}></div>
                </div>
                <p className="mt-3 text-xs text-slate-400">{dashboard.present_today} of {dashboard.total_employees} active employees checked in</p>
              </div>
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Leave Summary</h3>
                <div className="mt-6 flex justify-between border-b py-3 text-sm">
                  <span className="text-slate-500">Pending requests</span><strong>{dashboard.pending_leave_requests}</strong>
                </div>
                <div className="flex justify-between py-3 text-sm">
                  <span className="text-slate-500">Approved requests</span><strong>{dashboard.approved_leave_requests}</strong>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <p className="mt-4 text-sm text-slate-500">Recent attendance and leave activity will appear here.</p>
            </section>
          </>
        )}
        <p className="mt-8 text-center text-xs text-slate-400">WorkTrack · Leave & Attendance Management System</p>
      </main>
    </div>
  )
}

function StatCard({ title, value, note }: { title: string; value: number; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{note}</p>
    </div>
  )
}

export default App
