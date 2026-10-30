import { useState } from 'react'

const LINKS = [
  ['#home', 'Home'],
  ['#about', 'About Us'],
  ['#life', 'Life at Elen'],
  ['#growth', 'Growth & Learning'],
  ['#benefits', 'Rewards & Benefits'],
  ['#jobs', 'Job Opportunities'],
  ['#apply', 'How to Apply'],
] as const

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header>
      <div className="wrap nav">
        <a className="brand" href="#home">
          <span className="mark">E</span>
          <span>
            <strong>ELEN</strong>
            <small>
              ENGINEERING
              <br />
              Transformers | Switchgear | Power Solutions
            </small>
          </span>
        </a>
        <button
          className="mobile btn outline"
          aria-expanded={open}
          aria-controls="links"
          onClick={() => setOpen((o) => !o)}
        >
          Menu ☰
        </button>
        <nav className={`links${open ? ' show' : ''}`} id="links">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <a className="btn primary" href="#jobs">
          Apply Now
        </a>
      </div>
    </header>
  )
}
