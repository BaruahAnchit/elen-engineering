import { DEPARTMENTS, LEVELS, type JobsSource } from '../lib/jobs';
import type { Filters, Job } from '../types';

interface Props {
  jobs: Job[];
  allJobs: Job[];
  source: JobsSource;
  locations: string[];
  filters: Filters;
  onFilters: (f: Filters) => void;
  onView: (id: string) => void;
  onApply: (id: string) => void;
}

export function JobsSection({ jobs, allJobs, source, locations, filters, onFilters, onView, onApply }: Props) {
  const set = (patch: Partial<Filters>) => onFilters({ ...filters, ...patch });

  return (
    <section className="section alt" id="jobs">
      <div className="wrap">
        <span className="eyebrow">Find your next step</span>
        <h2>Job Opportunities</h2>
        <p className="intro">
          Explore example roles that may suit a transformer and switchgear business. These are illustrative role
          profiles, not confirmed vacancies.
        </p>

        <div className="job-controls">
          <input
            type="search"
            aria-label="Search roles or skills"
            placeholder="Search roles or skills"
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
          />
          <select aria-label="Department" value={filters.dept} onChange={(e) => set({ dept: e.target.value })}>
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select aria-label="Experience level" value={filters.level} onChange={(e) => set({ level: e.target.value })}>
            <option value="">All experience levels</option>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <select aria-label="Location" value={filters.location} onChange={(e) => set({ location: e.target.value })}>
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="jobs" aria-live="polite">
          {source === 'loading' && allJobs.length === 0 ? (
            <p className="jobs-status" role="status">
              Loading roles…
            </p>
          ) : jobs.length === 0 ? (
            <p>No matching roles. Try another search or filter.</p>
          ) : (
            jobs.map((job) => (
              <article className="job" key={job.id}>
                <span className="tag">{job.dept}</span>
                <h3>{job.title}</h3>
                <div className="job-meta">
                  <span>{job.level}</span>
                  <span>⌖ {job.location}</span>
                </div>
                <p>{job.skills}</p>
                <div className="job-actions">
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => onApply(job.id)}
                    aria-label={`Apply for ${job.title}`}
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    className="btn outline"
                    onClick={() => onView(job.id)}
                    aria-label={`View role: ${job.title}`}
                  >
                    View role →
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <p className="note">
          Illustrative career page prototype. Confirm current vacancies, qualifications, location and employment terms
          with Elen Engineering before applying.
        </p>
      </div>
    </section>
  );
}
