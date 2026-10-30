import { useState } from 'react'
import { ApplyError, submitApplication } from '../api'
import type { ApplicationForm, Role } from '../types'

const EMPTY: ApplicationForm = { name: '', email: '', phone: '', message: '', cvUrl: '', consent: false, website: '' }

interface Props {
  role: Role
  onClose: () => void
}

export default function ApplyForm({ role, onClose }: Props) {
  const [form, setForm] = useState<ApplicationForm>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')
  const [error, setError] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [emailQueued, setEmailQueued] = useState(false)

  const set = <K extends keyof ApplicationForm>(key: K, value: ApplicationForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    setFields({})
    try {
      const result = await submitApplication(role.title, form)
      setEmailQueued(result.emailQueued)
      setStatus('done')
    } catch (err) {
      const apply = err instanceof ApplyError ? err : new ApplyError('Something went wrong. Please try again.')
      setError(apply.message)
      setFields(apply.fields)
      setStatus('idle')
    }
  }

  if (status === 'done') {
    return (
      <div className="apply-done" role="status">
        <h3>Application received</h3>
        <p>
          Thank you for applying for <b>{role.title}</b>.{' '}
          {emailQueued
            ? `We're sending a confirmation to ${form.email}. If you don't see it in a few minutes, check your spam folder.`
            : 'Our recruitment team will review it and get in touch.'}
        </p>
        <button className="btn primary" onClick={onClose}>
          Close
        </button>
      </div>
    )
  }

  const busy = status === 'submitting'

  return (
    <form className="apply-form" onSubmit={onSubmit}>
      <h3>Apply for this role</h3>

      <label>
        Full name *
        <input value={form.name} onChange={(e) => set('name', e.target.value)} required minLength={2} maxLength={100} autoComplete="name" />
        {fields.name && <span className="err">{fields.name}</span>}
      </label>

      <label>
        Email *
        <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required maxLength={254} autoComplete="email" />
        {fields.email && <span className="err">{fields.email}</span>}
      </label>

      <label>
        Phone
        <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} maxLength={20} autoComplete="tel" />
        {fields.phone && <span className="err">{fields.phone}</span>}
      </label>

      <label>
        CV / portfolio link
        <input type="url" placeholder="https://" value={form.cvUrl} onChange={(e) => set('cvUrl', e.target.value)} maxLength={500} />
        {fields.cvUrl && <span className="err">{fields.cvUrl}</span>}
      </label>

      <label>
        Tell us about your relevant skills and experience
        <textarea value={form.message} onChange={(e) => set('message', e.target.value)} maxLength={2000} />
        {fields.message && <span className="err">{fields.message}</span>}
      </label>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
        </label>
      </div>

      <label className="check">
        <input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} required />
        <span>I agree that Elen Engineering may store my details and contact me about this application.</span>
      </label>
      {fields.consent && <span className="err">{fields.consent}</span>}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button className="btn primary" type="submit" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit application'}
      </button>
    </form>
  )
}
