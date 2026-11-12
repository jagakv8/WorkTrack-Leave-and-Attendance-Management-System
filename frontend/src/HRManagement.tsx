import { useEffect, useState } from 'react'
import api from './api'

type LeaveRequest = {
  id: number
  employee_code: string
  employee_name: string
  leave_type: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  status: string
}

type Balance = {
  employee_code: string
  employee_name: string
  department: string | null
  leave_type: string
  total_days: number
  used_days: number
  remaining_days: number
}

function ErrorMessage({ message }: { message: string }) {
  return message ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p> : null
}

export function HRLeaveRequests() {
  const [items, setItems] = useState<LeaveRequest[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/hr/leave-requests')
      .then(response => setItems(response.data))
      .catch(err => setError(err.response?.data?.detail || 'Unable to load leave requests.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="space-y-4">
      <div className="rounded-xl border bg-white p-6">
        <h3 className="text-xl font-bold">All Employee Leave Requests</h3>
        <p className="mt-2 text-sm text-slate-500">Complete leave application history and approval status.</p>
        <p className="mt-3 font-medium">Total requests: {items.length}</p>
      </div>
      <ErrorMessage message={error} />
      {loading ? <p>Loading leave requests...</p> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>{['Request', 'Employee', 'Leave', 'Dates', 'Days', 'Status'].map(x => <th key={x} className="p-4">{x}</th>)}</tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">#{item.id}</td>
                  <td className="p-4"><strong>{item.employee_name}</strong><p className="text-xs text-slate-500">{item.employee_code}</p></td>
                  <td className="p-4">{item.leave_type}</td>
                  <td className="p-4">{item.start_date}<br />to {item.end_date}</td>
                  <td className="p-4">{item.total_days}</td>
                  <td className="p-4"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium">{item.status.replaceAll('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && !error && <p className="p-6 text-center text-slate-500">No leave requests found.</p>}
        </div>
      )}
    </section>
  )
}

export function HRLeaveBalances() {
  const [items, setItems] = useState<Balance[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/hr/leave-balances')
      .then(response => setItems(response.data))
      .catch(err => setError(err.response?.data?.detail || 'Unable to load leave balances.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="space-y-4">
      <div className="rounded-xl border bg-white p-6">
        <h3 className="text-xl font-bold">Employee Leave Balances</h3>
        <p className="mt-2 text-sm text-slate-500">Company-wide leave balance overview.</p>
        <p className="mt-3 font-medium">Balance records: {items.length}</p>
      </div>
      <ErrorMessage message={error} />
      {loading ? <p>Loading balances...</p> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>{['Employee', 'Department', 'Leave Type', 'Total', 'Used', 'Remaining'].map(x => <th key={x} className="p-4">{x}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item.employee_code}-${item.leave_type}-${index}`} className="border-t">
                  <td className="p-4"><strong>{item.employee_name}</strong><p className="text-xs text-slate-500">{item.employee_code}</p></td>
                  <td className="p-4">{item.department || '—'}</td>
                  <td className="p-4">{item.leave_type}</td>
                  <td className="p-4">{item.total_days}</td>
                  <td className="p-4">{item.used_days}</td>
                  <td className="p-4 font-semibold text-green-700">{item.remaining_days}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && !error && <p className="p-6 text-center text-slate-500">No balance records found.</p>}
        </div>
      )}
    </section>
  )
}

export function HRSettings() {
  const [settings, setSettings] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/hr/settings')
      .then(response => setSettings(response.data))
      .catch(err => setError(err.response?.data?.detail || 'Unable to load settings.'))
  }, [])

  return (
    <section className="space-y-5">
      <div className="rounded-xl border bg-white p-6">
        <h3 className="text-xl font-bold">WorkTrack Settings</h3>
        <p className="mt-2 text-sm text-slate-500">Current system configuration. These values are read-only.</p>
      </div>
      <ErrorMessage message={error} />
      {!settings && !error ? <p>Loading settings...</p> : settings && (
        <>
          <div className="rounded-xl border bg-white p-6">
            <h4 className="font-semibold">Office Geofence</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><p className="text-sm text-slate-500">Office latitude</p><p className="mt-1 font-medium">{settings.office_latitude}</p></div>
              <div><p className="text-sm text-slate-500">Office longitude</p><p className="mt-1 font-medium">{settings.office_longitude}</p></div>
              <div><p className="text-sm text-slate-500">Allowed radius</p><p className="mt-1 font-medium">{settings.geofence_radius_meters} metres</p></div>
              <div><p className="text-sm text-slate-500">Location verification</p><p className="mt-1 font-medium">{settings.attendance_location_verification ? 'Enabled' : 'Disabled'}</p></div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-6">
            <h4 className="font-semibold">Leave Approval Workflow</h4>
            <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
              {settings.leave_approval_workflow.map((step: string) => <li key={step}>{step}</li>)}
            </ol>
          </div>
          <p className="text-xs text-slate-500">Configuration is displayed from the current server settings. Editing settings is not enabled.</p>
        </>
      )}
    </section>
  )
}
