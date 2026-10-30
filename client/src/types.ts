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
}

export interface ApplicationForm {
  name: string
  email: string
  phone: string
  message: string
  cvUrl: string
  consent: boolean
  website: string // honeypot: must stay empty
}

export interface ApplicationResult {
  ok: true
  emailQueued: boolean
}

export interface JobFilters {
  q: string
  dept: string
  level: string
  location: string
}
