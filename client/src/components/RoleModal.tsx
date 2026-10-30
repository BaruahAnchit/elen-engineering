import { useEffect, useState } from 'react'
import type { Role } from '../types'
import ApplyForm from './ApplyForm'

interface Props {
  role: Role | null
  onClose: () => void
}

// Keyed by role so the form state resets whenever a different role is opened.
export default function RoleModal({ role, onClose }: Props) {
  return role ? <RoleDialog key={role.title} role={role} onClose={onClose} /> : null
}

function RoleDialog({ role, onClose }: { role: Role; onClose: () => void }) {
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="modal open"
      // While a form is open, a stray click outside must not throw away what was typed.
      onClick={(e) => e.target === e.currentTarget && !applying && onClose()}
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
        {applying ? (
          <ApplyForm role={role} onClose={onClose} />
        ) : (
          <button className="btn primary" onClick={() => setApplying(true)}>
            Apply for this role
          </button>
        )}
      </div>
    </div>
  )
}
