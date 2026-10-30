import { useCallback, useEffect, useState } from 'react'
import { fetchRoles } from './api'
import type { Role } from './types'

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchRoles()
      .then((data) => {
        if (cancelled) return
        setRoles(data.roles)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = useCallback(() => {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }, [])

  return { roles, status, retry }
}
