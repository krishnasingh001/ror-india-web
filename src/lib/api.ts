import type { Company, Job, JobFilters, Paginated } from '@/types'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed (${res.status})`)
  }

  return res.json() as Promise<T>
}

function toQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'all') {
      q.set(key, String(value))
    }
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export function fetchJobs(filters: JobFilters = {}) {
  return request<Paginated<Job>>(
    `/jobs${toQuery({
      search_keywords: filters.search_keywords,
      search_location: filters.search_location,
      job_type: filters.job_type,
      experience_level: filters.experience_level,
      work_mode: filters.work_mode,
      sort_by: filters.sort_by,
      page: filters.page,
    })}`,
  )
}

export function fetchJob(id: string | number) {
  return request<{ data: Job }>(`/jobs/${id}`)
}

export function fetchCompanies(params: { search?: string; page?: number } = {}) {
  return request<Paginated<Company>>(
    `/companies${toQuery({ search: params.search, page: params.page })}`,
  )
}

export function fetchCompany(id: string | number) {
  return request<{ data: Company; jobs: Job[] }>(`/companies/${id}`)
}
