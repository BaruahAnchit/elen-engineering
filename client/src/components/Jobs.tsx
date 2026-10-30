import { DEPARTMENTS, LEVELS, LOCATIONS } from '../constants'
import type { JobFilters, Role } from '../types'

interface Props {
  roles: Role[]
  status: 'loading' | 'error' | 'ready'
  filters: JobFilters
  onFiltersChange: (filters: JobFilters) => void
  onViewRole: (role: Role) => void
  onRetry: () => void
}

function matchesFilters(role: Role, { q, dept, level, location }: JobFilters) {
  const query = q.trim().toLowerCase()
  return (
    (!query || `${role.title} ${role.skills} ${role.dept}`.toLowerCase().includes(query)) &&
    (!dept || role.dept === dept) &&
    (!level || role.level === level) &&
    (!location || role.location === location)
  )
}

export default function Jobs({ roles, status, filters, onFiltersChange, onViewRole, onRetry }: Props) {
  const set = (patch: Partial<JobFilters>) => onFiltersChange({ ...filters, ...patch })
  const found = roles.filter((r) => matchesFilters(r, filters))

  return (
    <section className="section alt" id="jobs">
      <div className="wrap">
        <span className="eyebrow">Find your next step</span>
        <h2>Job Opportunities</h2>
        <p className="intro">
          Explore example roles that may suit a transformer and switchgear business. These are
          illustrative role profiles, not confirmed vacancies.
        </p>
        <div className="job-controls">
          <input
            type="search"
            placeholder="Search roles or skills"
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
          />
          <select
            aria-label="Department"
            value={filters.dept}
            onChange={(e) => set({ dept: e.target.value })}
          >
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            aria-label="Experience level"
            value={filters.level}
            onChange={(e) => set({ level: e.target.value })}
          >
            <option value="">All experience levels</option>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <select
            aria-label="Location"
            value={filters.location}
            onChange={(e) => set({ location: e.target.value })}
          >
            <option value="">All locations</option>
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="jobs">
          {status === 'loading' && <p>Loading roles…</p>}
          {status === 'error' && (
            <p>
              Couldn&apos;t load roles right now.{' '}
              <button className="btn outline" onClick={onRetry}>
                Try again
              </button>
            </p>
          )}
          {status === 'ready' && found.length === 0 && (
            <p>No matching sample roles. Try another search or filter.</p>
          )}
          {status === 'ready' &&
            found.map((r) => (
              <article className="job" key={r.title}>
                <span className="tag">{r.dept}</span>
                <h3>{r.title}</h3>
                <div className="job-meta">
                  <span>{r.level}</span>
                  <span>⌖ {r.location}</span>
                </div>
                <p>{r.skills}</p>
                <button className="btn outline" onClick={() => onViewRole(r)}>
                  View role →
                </button>
              </article>
            ))}
        </div>

        <p className="note">
          Illustrative career page prototype. Confirm current vacancies, qualifications, location and
          employment terms with Elen Engineering before applying.
        </p>
      </div>
    </section>
  )
}
