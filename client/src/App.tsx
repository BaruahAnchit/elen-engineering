import { useCallback, useState } from 'react'
import { useRoles } from './hooks'
import type { JobFilters, Role } from './types'
import Header from './components/Header'
import Hero from './components/Hero'
import Jobs from './components/Jobs'
import RoleModal from './components/RoleModal'
import ScrollProgress from './components/ScrollProgress'
import { About, BenefitStrip, Cta, Faq, Footer, Growth, HowToApply, Life, Rewards } from './components/Sections'

const NO_FILTERS: JobFilters = { q: '', dept: '', level: '', location: '' }

export default function App() {
  const { roles, status, retry } = useRoles()
  const [filters, setFilters] = useState<JobFilters>(NO_FILTERS)
  const [selected, setSelected] = useState<Role | null>(null)
  const closeModal = useCallback(() => setSelected(null), [])

  const searchFromHero = (next: JobFilters) => {
    setFilters(next)
    document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <ScrollProgress />
      <Header />
      <main>
        <Hero onSearch={searchFromHero} />
        <BenefitStrip />
        <About />
        <Life />
        <Growth />
        <Rewards />
        <Jobs
          roles={roles}
          status={status}
          filters={filters}
          onFiltersChange={setFilters}
          onViewRole={setSelected}
          onRetry={retry}
        />
        <HowToApply />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <RoleModal role={selected} onClose={closeModal} />
    </>
  )
}
