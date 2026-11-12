import { useEffect, useState } from 'react'
import api from './api'

type LeaveRequest = {
  id: number
  employee_id: number
  leave_type: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  status: string
}

export default function HRApprovals() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [comments, setComments] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadRequests() {
    try {
      const response = await api.get('/approvals/hr/pending')
      setRequests(response.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to load HR approvals.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function decide(requestId: number, action: 'approve' | 'reject') {
    setBusyId(requestId)
    setMessage('')
    setError('')

    try {
      await api.post(`/approvals/hr/${requestId}/decision`, {
        action,
        comments: comments[requestId] || '',
      })

      setMessage(
        action === 'approve'
          ? `Request #${requestId} finally approved. Leave balance updated.`
          : `Request #${requestId} rejected.`
      )
      await loadRequests()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to process HR decision.')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <p className="p-6 text-slate-500">Loading HR approvals...</p>

  return (
    <section className="space-y-5">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">HR Final Approvals</h2>
        <p className="mt-2 text-sm text-slate-500">
          Review manager-approved leave requests and make the final decision.
        </p>
        <p className="mt-4 text-sm font-medium">Pending HR approvals: {requests.length}</p>
      </div>

      {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {requests.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-slate-500">
          No pending HR approvals.
        </div>
      ) : requests.map((request) => (
        <article key={request.id} className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Leave Request #{request.id}</h3>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              Pending HR
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><p className="text-xs text-slate-500">Employee ID</p><p className="mt-1 font-medium">{request.employee_id}</p></div>
            <div><p className="text-xs text-slate-500">Leave type</p><p className="mt-1 font-medium">{request.leave_type}</p></div>
            <div><p className="text-xs text-slate-500">Total days</p><p className="mt-1 font-medium">{request.total_days}</p></div>
            <div><p className="text-xs text-slate-500">Start date</p><p className="mt-1 font-medium">{request.start_date}</p></div>
            <div><p className="text-xs text-slate-500">End date</p><p className="mt-1 font-medium">{request.end_date}</p></div>
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Employee reason</p>
            <p className="mt-1 text-sm">{request.reason}</p>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium">HR comments</label>
            <textarea
              value={comments[request.id] || ''}
              onChange={(event) => setComments((previous) => ({
                ...previous,
                [request.id]: event.target.value,
              }))}
              maxLength={1000}
              rows={2}
              placeholder="Add HR comments (optional)"
              className="w-full rounded-lg border border-slate-300 p-3"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={busyId !== null}
              onClick={() => decide(request.id, 'approve')}
              className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {busyId === request.id ? 'Processing...' : 'Final Approve'}
            </button>
            <button
              disabled={busyId !== null}
              onClick={() => decide(request.id, 'reject')}
              className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </article>
      ))}
    </section>
  )
}
