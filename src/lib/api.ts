import type { Company, DashboardData, Job, JobFilters, Paginated, User } from '@/types'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api/v1'

let csrfToken: string | null = null

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export async function ensureCsrf() {
  if (csrfToken) return csrfToken
  const fromCookie = readCookie('CSRF-TOKEN')
  if (fromCookie) {
    csrfToken = fromCookie
    return csrfToken
  }
  const res = await fetch(`${API_BASE}/auth/csrf`, { credentials: 'include' })
  const data = (await res.json()) as { csrf_token: string }
  csrfToken = data.csrf_token
  return csrfToken
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || 'GET').toUpperCase()
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }

  if (method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
    const token = await ensureCsrf()
    headers['X-CSRF-Token'] = token
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}

  if (!res.ok) {
    const err = new Error(data.message || data.error || `Request failed (${res.status})`) as Error & {
      status?: number
      payload?: unknown
    }
    err.status = res.status
    err.payload = data
    throw err
  }

  return data as T
}

function toQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'all') q.set(key, String(value))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const api = {
  fetchJobs: (filters: JobFilters = {}) =>
    request<Paginated<Job>>(
      `/jobs${toQuery({
        search_keywords: filters.search_keywords,
        search_location: filters.search_location,
        job_type: filters.job_type,
        experience_level: filters.experience_level,
        work_mode: filters.work_mode,
        sort_by: filters.sort_by,
        page: filters.page,
      })}`,
    ),

  fetchJob: (id: string | number) => request<{ data: Job }>(`/jobs/${id}`),

  fetchCompanies: (params: { search?: string; page?: number } = {}) =>
    request<Paginated<Company>>(`/companies${toQuery({ search: params.search, page: params.page })}`),

  fetchCompany: (id: string | number) =>
    request<{ data: Company; jobs: Job[] }>(`/companies/${id}`),

  me: () => request<{ user: User | null }>('/auth/me'),

  login: (email: string, password: string) =>
    request<{ success: boolean; user: User; redirect_to: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: {
    name: string
    email: string
    password: string
    password_confirmation: string
    role: string
  }) =>
    request<{ success: boolean; requires_confirmation: boolean; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'DELETE' }),

  dashboard: () => request<DashboardData>('/dashboard'),

  savedJobs: (page = 1) => request<Paginated<Job>>(`/saved_jobs${toQuery({ page })}`),

  saveJob: (jobId: number) =>
    request<{ success: boolean; saved: boolean }>(`/jobs/${jobId}/save`, { method: 'POST' }),

  unsaveJob: (jobId: number) =>
    request<{ success: boolean; saved: boolean }>(`/jobs/${jobId}/save`, { method: 'DELETE' }),

  applications: (page = 1) =>
    request<Paginated<{ id: number; status?: string; created_at: string; job: Job }>>(
      `/applications${toQuery({ page })}`,
    ),

  applyToJob: (jobId: number) =>
    request<{ success: boolean; applied: boolean; message: string; redirect?: string }>(
      `/jobs/${jobId}/application`,
      { method: 'POST' },
    ),

  withdrawApplication: (jobId: number) =>
    request<{ success: boolean; applied: boolean }>(`/jobs/${jobId}/application`, {
      method: 'DELETE',
    }),

  followCompany: (companyId: number) =>
    request<{ success: boolean; followed: boolean }>(`/companies/${companyId}/follow`, {
      method: 'POST',
    }),

  unfollowCompany: (companyId: number) =>
    request<{ success: boolean; followed: boolean }>(`/companies/${companyId}/follow`, {
      method: 'DELETE',
    }),
}
