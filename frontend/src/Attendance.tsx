import { useState } from 'react'
import api from './api'

type AttendanceRecord = {
  employee_id: number
  employee_code: string
  employee_name: string
  department: string | null
  attendance_date: string
  check_in_time: string | null
  check_out_time: string | null
  status: string
}

function Attendance() {
  const today = new Date().toISOString().slice(0, 10)
  const firstDay = `${today.slice(0, 7)}-01`

  const [startDate, setStartDate] = useState(firstDay)
  const [endDate, setEndDate] = useState(today)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  async function loadAttendance() {
    setLoading(true)
    setError('')
    setSearched(true)

    try {
      const response = await api.get('/attendance/reports', {
        params: { start_date: startDate, end_date: endDate },
      })
      setRecords(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to load attendance records.')
    } finally {
      setLoading(false)
    }
  }

  async function exportCSV() {
    try {
      const response = await api.get('/attendance/reports/export', {
        params: { start_date: startDate, end_date: endDate },
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `attendance_report_${startDate}_${endDate}.csv`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Unable to export attendance report.')
    }
  }

  function formatTime(value: string | null) {
    if (!value) return '—'
    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Attendance Management</h2>
        <p className="mt-1 text-sm text-slate-500">View employee attendance and export reports.</p>
      </div>

      <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">Filter Attendance</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Start Date</label>
            <input type="date" value={startDate} max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border px-3 py-2.5" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">End Date</label>
            <input type="date" value={endDate} min={startDate} max={today}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border px-3 py-2.5" />
          </div>
          <button onClick={loadAttendance} disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Loading...' : 'Search'}
          </button>
          <button onClick={exportCSV}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50">
            Export CSV
          </button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h3 className="font-semibold">Attendance Records</h3>
          <p className="mt-1 text-xs text-slate-500">{records.length} records found</p>
        </div>
        {!searched ? (
          <p className="p-8 text-center text-sm text-slate-500">Select a date range and click Search.</p>
        ) : loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading records...</p>
        ) : records.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No attendance records found for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Check In</th>
                  <th className="px-5 py-4">Check Out</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((record, index) => (
                  <tr key={`${record.employee_id}-${record.attendance_date}-${index}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{record.employee_name}</p>
                      <p className="text-xs text-slate-500">{record.employee_code}</p>
                    </td>
                    <td className="px-5 py-4">{record.department || '—'}</td>
                    <td className="px-5 py-4">{record.attendance_date}</td>
                    <td className="px-5 py-4">{formatTime(record.check_in_time)}</td>
                    <td className="px-5 py-4">{formatTime(record.check_out_time)}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                        {record.status}
                      </span>
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

export default Attendance
