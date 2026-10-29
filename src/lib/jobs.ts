import { useEffect, useState } from 'react';
import { equalTo, onValue, orderByChild, query, ref } from 'firebase/database';
import sampleRoles from '../data/sampleRoles.json';
import type { Job } from '../types';
import { getFirebase } from './firebase';

export const DEPARTMENTS = ['Engineering', 'Manufacturing', 'Quality', 'Sales', 'Human Resources'];
export const LEVELS = ['Entry level', 'Experienced'];

export const SAMPLE_JOBS: Job[] = sampleRoles.map(({ id, title, dept, level, location, skills, desc }) => ({
  id,
  title,
  dept,
  level,
  location,
  skills,
  desc,
}));

/** Database content is untrusted: accept only well-formed records. */
function parseJob(id: string, value: unknown): Job | null {
  if (typeof value !== 'object' || value === null) return null;
  const r = value as Record<string, unknown>;
  const str = (k: string) => (typeof r[k] === 'string' ? (r[k] as string) : '');
  const job: Job = {
    id,
    title: str('title'),
    dept: str('dept'),
    level: str('level'),
    location: str('location'),
    skills: str('skills'),
    desc: str('desc'),
  };
  return job.title && job.dept && job.level && job.location ? job : null;
}

/** 'loading' until the first snapshot; 'live' = from the database; 'sample' = bundled fallback. */
export type JobsSource = 'loading' | 'live' | 'sample';

const FIRST_SNAPSHOT_TIMEOUT_MS = 5000;

export function useJobs(): { jobs: Job[]; source: JobsSource } {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [source, setSource] = useState<JobsSource>('loading');

  useEffect(() => {
    const fb = getFirebase();
    const useSample = () => {
      setJobs(SAMPLE_JOBS);
      setSource('sample');
    };

    if (!fb) {
      useSample();
      return;
    }

    // If the database is unreachable, onValue never fires, so don't leave the page empty.
    const timer = window.setTimeout(useSample, FIRST_SNAPSHOT_TIMEOUT_MS);

    const q = query(ref(fb.db, 'jobs'), orderByChild('active'), equalTo(true));
    const unsubscribe = onValue(
      q,
      (snap) => {
        window.clearTimeout(timer);
        const live: Job[] = [];
        snap.forEach((child) => {
          const job = parseJob(child.key ?? '', child.val());
          if (job) live.push(job);
        });
        // Until real vacancies are seeded, show the illustrative roles rather than an empty page.
        if (live.length === 0) {
          useSample();
        } else {
          setJobs(live);
          setSource('live');
        }
      },
      () => {
        window.clearTimeout(timer);
        useSample();
      },
    );

    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return { jobs, source };
}
