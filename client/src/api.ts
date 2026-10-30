import axios from 'axios'
import type { ApplicationForm, ApplicationResult, RolesResponse } from './types'

// Same-origin by default (Vite proxy in dev, Express in production).
// Set VITE_API_URL at build time if the API is hosted somewhere else.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '' })

export async function fetchRoles(): Promise<RolesResponse> {
  const { data } = await api.get<RolesResponse>('/api/roles')
  return data
}

export class ApplyError extends Error {
  fields: Record<string, string>
  constructor(message: string, fields: Record<string, string> = {}) {
    super(message)
    this.fields = fields
  }
}

export async function submitApplication(
  roleTitle: string,
  form: ApplicationForm,
): Promise<ApplicationResult> {
  try {
    const { data } = await api.post<ApplicationResult>('/api/applications', { roleTitle, ...form })
    return data
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      const d = e.response.data as { error?: string; fields?: Record<string, string> } | undefined
      throw new ApplyError(d?.error ?? 'Something went wrong. Please try again.', d?.fields)
    }
    throw new ApplyError('Could not reach the server. Please check your connection and try again.')
  }
}
