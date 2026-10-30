import axios from 'axios'
import type { RolesResponse } from './types'

// Same-origin by default (Vite proxy in dev, Express in production).
// Set VITE_API_URL at build time if the API is hosted somewhere else.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '' })

export async function fetchRoles(): Promise<RolesResponse> {
  const { data } = await api.get<RolesResponse>('/api/roles')
  return data
}
