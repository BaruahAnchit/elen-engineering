import { useEffect } from 'react'
import type { Role } from '../types'

interface Props {
  role: Role | null
  applyEmail: string | null
  onClose: () => void
}

function prepareApplication(role: Role, configuredEmail: string | null) {
  // Use the HR address configured on the server (HR_EMAIL); otherwise ask, as the prototype did.
  const email =
    configuredEmail ??
    window.prompt(
      'Enter the verified recruitment email address. This prototype does not have a confirmed HR email:',
    )
  if (!email || !email.includes('@')) {
    window.alert('Please enter a valid, verified recruitment email address.')
    return
  }
  const subject = encodeURIComponent(`Application interest: ${role.title}`)
  const body = encodeURIComponent(
    `Dear Recruitment Team,\n\nI am interested in the ${role.title} opportunity.\n\nName:\nPhone:\nRelevant skills/experience:\n\nI have attached my CV for your consideration.\n\nRegards,`,
  )
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
}

export default function RoleModal({ role, applyEmail, onClose }: Props) {
  useEffect(() => {
    if (!role) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [role, onClose])

  if (!role) return null

  return (
    <div
      className="modal open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="role-title">
        <button className="close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <span className="tag">
          {role.dept} · {role.level}
        </span>
        <h2 id="role-title">{role.title}</h2>
        <p>
          <b>Location:</b> {role.location}
        </p>
        <p>
          <b>Skills:</b> {role.skills}
        </p>
        <p>{role.desc}</p>
        <p>
          <b>Note:</b> This is an illustrative role profile, not a confirmed vacancy.
        </p>
        <button className="btn primary" onClick={() => prepareApplication(role, applyEmail)}>
          Prepare application email
        </button>
      </div>
    </div>
  )
}
