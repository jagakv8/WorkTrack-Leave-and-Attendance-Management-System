import { useEffect, useState } from 'react'
import api from './api'

type AttendanceRecord = {
  id: number
  attendance_date: string
  check_in_time: string | null
  check_out_time: string | null
  check_in_distance_meters: number | null
  check_out_distance_meters: number | null
  status: string
}

export default function EmployeeAttendance() {
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
    accuracy: number
  } | null>(null)

  async function loadHistory() {
    try {
      const response = await api.get('/attendance/my-history')
      setHistory(response.data)
    } catch {
      setError('Unable to load attendance history. Please sign in again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  function getLocation(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GPS is not supported by this browser.'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        (err) => reject(new Error(err.message || 'Unable to get your location.')),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      )
    })
  }

  async function markAttendance(action: 'check-in' | 'check-out') {
    setBusy(true)
    setError('')
    setMessage('Please allow location access when your browser asks.')

    try {
      const coordinates = await getLocation()
      setLocation(coordinates)

      const response = await api.post(`/attendance/${action}`, coordinates)

      const distance = action === 'check-in'
        ? response.data.check_in_distance_meters
        : response.data.check_out_distance_meters

      setMessage(
        `${action === 'check-in' ? 'Check-in' : 'Check-out'} successful. Distance from office: ${distance ?? 'verified'} metres.`
      )

      await loadHistory()
    } catch (err: any) {
      setMessage('')
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError(err.message || 'Attendance action failed.')
      }
    } finally {
      setBusy(false)
    }
  }

  const today = new Date().toLocaleDateString('en-CA')
  const todayRecord = history.find((record) => record.attendance_date === today)
  const hasCheckedIn = Boolean(todayRecord?.check_in_time)
  const hasCheckedOut = Boolean(todayRecord?.check_out_time)

  function formatTime(value: string | null) {
    if (!value) return '—'
    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">My Attendance</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your location must be within the office geofence to mark attendance.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Today's check-in</p>
            <p className="mt-2 text-2xl font-bold">{formatTime(todayRecord?.check_in_time ?? null)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Today's check-out</p>
            <p className="mt-2 text-2xl font-bold">{formatTime(todayRecord?.check_out_time ?? null)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => markAttendance('check-in')}
            disabled={busy || hasCheckedIn}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Please wait...' : 'Check In'}
          </button>
          <button
            onClick={() => markAttendance('check-out')}
            disabled={busy || !hasCheckedIn || hasCheckedOut}
            className="rounded-lg bg-slate-800 px-6 py-3 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Please wait...' : 'Check Out'}
          </button>
        </div>

        {message && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {location && (
          <p className="mt-3 text-xs text-slate-400">
            Location detected: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            <br />
            GPS accuracy: approximately {Math.round(location.accuracy)} metres
          </p>
        )}
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Attendance History</h3>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading attendance history...</p>
        ) : history.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No attendance records found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Check-in</th>
                  <th className="p-3">Check-out</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id} className="border-b last:border-0">
                    <td className="p-3">{record.attendance_date}</td>
                    <td className="p-3">{formatTime(record.check_in_time)}</td>
                    <td className="p-3">{formatTime(record.check_out_time)}</td>
                    <td className="p-3 capitalize">{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
