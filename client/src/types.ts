export interface Role {
  title: string
  dept: string
  level: string
  location: string
  skills: string
  desc: string
}

export interface RolesResponse {
  roles: Role[]
  applyEmail: string | null
}

export interface JobFilters {
  q: string
  dept: string
  level: string
  location: string
}
