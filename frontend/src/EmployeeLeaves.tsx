import { useEffect, useState } from 'react'
import api from './api'

type LeaveRequest = {
  id: number
  leave_type: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  status: string
}

type LeaveBalance = {
  leave_type: string
  total_days: number
  used_days: number
  remaining_days: number
}

export default function EmployeeLeaves() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [leaveType, setLeaveType] = useState('CL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadData() {
    try {
      const [requestResponse, balanceResponse] = await Promise.all([
        api.get('/leaves/my-requests'),
        api.get('/leaves/my-balances'),
      ])
      setRequests(requestResponse.data)
      setBalances(balanceResponse.data)
    } catch {
      setError('Unable to load leave information.')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function applyLeave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/leaves/apply', {
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason,
      })
      setMessage(`Leave request #${response.data.id} submitted successfully.`)
      setStartDate('')
      setEndDate('')
      setReason('')
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to submit leave request.')
    } finally {
      setLoading(false)
    }
  }

  function statusLabel(status: string) {
    return status.replaceAll('_', ' ')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">My Leave Balance</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {balances.map((balance) => (
            <div key={balance.leave_type} className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{balance.leave_type}</p>
              <p className="mt-2 text-2xl font-bold">{balance.remaining_days}</p>
              <p className="mt-1 text-xs text-slate-500">
                Remaining of {balance.total_days} days
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Apply for Leave</h2>
        <form onSubmit={applyLeave} className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Leave type</label>
            <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3">
              <option value="CL">Casual Leave (CL)</option>
              <option value="SL">Sick Leave (SL)</option>
              <option value="EL">Earned Leave (EL)</option>
              <option value="LWP">Leave Without Pay (LWP)</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Start date</label>
            <input type="date" required value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">End date</label>
            <input type="date" required min={startDate || undefined} value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Reason</label>
            <textarea required minLength={5} maxLength={1000} value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for leave"
              className="w-full rounded-lg border border-slate-300 p-3" rows={3} />
          </div>
          <div className="md:col-span-2">
            <button disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
        {message && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">My Leave Requests</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">From</th>
                <th className="p-3">To</th>
                <th className="p-3">Days</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-b last:border-0">
                  <td className="p-3">{request.leave_type}</td>
                  <td className="p-3">{request.start_date}</td>
                  <td className="p-3">{request.end_date}</td>
                  <td className="p-3">{request.total_days}</td>
                  <td className="p-3 capitalize">{statusLabel(request.status)}</td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">No leave requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
