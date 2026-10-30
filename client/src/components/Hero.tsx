import { useState } from 'react'
import { DEPARTMENTS, LEVELS, LOCATIONS } from '../constants'
import type { JobFilters } from '../types'

interface Props {
  onSearch: (filters: JobFilters) => void
}

export default function Hero({ onSearch }: Props) {
  const [dept, setDept] = useState('')
  const [level, setLevel] = useState('')
  const [location, setLocation] = useState('')

  return (
    <section className="hero" id="home">
      <div className="wrap hero-inner">
        <div>
          <h1>
            Powering Progress.
            <br />
            Building Careers.
          </h1>
          <p>
            At Elen Engineering, we design and manufacture reliable transformers and switchgear
            solutions. Our strength lies in our people. Join us to be part of a team that powers
            industries and a brighter future.
          </p>
          <div className="actions">
            <a className="btn primary" href="#jobs">
              Explore Opportunities →
            </a>
            <a className="btn white" href="#life">
              Life at Elen ▶
            </a>
          </div>
        </div>
        <div className="finder">
          <h3>Find Your Role</h3>
          <select aria-label="Department" value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">Select Department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            aria-label="Experience level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="">Select Experience Level</option>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <select
            aria-label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Select Location</option>
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <button className="btn gold" onClick={() => onSearch({ q: '', dept, level, location })}>
            ⌕ Search Jobs
          </button>
        </div>
      </div>
    </section>
  )
}
