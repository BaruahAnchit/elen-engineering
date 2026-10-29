import { useEffect, useMemo, useState } from 'react';
import { ApplyModal } from './components/ApplyModal';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { JobModal } from './components/JobModal';
import { JobsSection } from './components/JobsSection';
import { About, Benefits, Cta, Faq, Footer, Growth, Highlights, HowToApply, Life } from './components/StaticSections';
import { useJobs } from './lib/jobs';
import type { Filters, Job, ModalState } from './types';

const NO_FILTERS: Filters = { q: '', dept: '', level: '', location: '' };

function useScrollProgress(): number {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return pct;
}

export function App() {
  const { jobs, source } = useJobs();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [modal, setModal] = useState<ModalState>(null);
  const progress = useScrollProgress();

  const locations = useMemo(() => Array.from(new Set(jobs.map((j) => j.location))).sort(), [jobs]);

  const visibleJobs = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        (!q || `${j.title} ${j.skills} ${j.dept}`.toLowerCase().includes(q)) &&
        (!filters.dept || j.dept === filters.dept) &&
        (!filters.level || j.level === filters.level) &&
        (!filters.location || j.location === filters.location),
    );
  }, [jobs, filters]);

  const findJob = (id: string): Job | undefined => jobs.find((j) => j.id === id);
  const close = () => setModal(null);

  // A role can disappear while its dialog is open (HR closes it): drop the dialog.
  const openRole = modal?.kind === 'role' ? findJob(modal.jobId) : undefined;
  const openApplyJob = modal?.kind === 'apply' && modal.jobId ? findJob(modal.jobId) : undefined;

  return (
    <>
      <div className="progress" style={{ width: `${progress}%` }} />
      <Header />
      <main>
        <Hero
          locations={locations}
          onSearch={({ dept, level, location }) => {
            setFilters({ q: '', dept, level, location });
            document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
        <Highlights />
        <About />
        <Life />
        <Growth />
        <Benefits />
        <JobsSection
          jobs={visibleJobs}
          allJobs={jobs}
          source={source}
          locations={locations}
          filters={filters}
          onFilters={setFilters}
          onView={(jobId) => setModal({ kind: 'role', jobId })}
          onApply={(jobId) => setModal({ kind: 'apply', jobId })}
        />
        <HowToApply onGeneralApply={() => setModal({ kind: 'apply', jobId: null })} />
        <Faq />
        <Cta />
      </main>
      <Footer />

      {openRole && (
        <JobModal
          job={openRole}
          onClose={close}
          onApply={() => setModal({ kind: 'apply', jobId: openRole.id })}
        />
      )}
      {modal?.kind === 'apply' && (modal.jobId === null || openApplyJob) && (
        <ApplyModal key={modal.jobId ?? 'general'} job={openApplyJob ?? null} onClose={close} />
      )}
    </>
  );
}
