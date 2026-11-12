import { useState } from 'react'
import api from './api'

function ChangePassword({ onPasswordChanged }: { onPasswordChanged?: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (newPassword.length < 8) {
      setError('New password must contain at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })

      setMessage(response.data.message || 'Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onPasswordChanged?.()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
      <p className="mt-1 text-sm text-slate-500">
        Update your account password regularly to keep your account secure.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Current Password
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            New Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            maxLength={128}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Enter new password (minimum 8 characters)"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Re-enter new password"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        {message && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </section>
  )
}

export default ChangePassword
