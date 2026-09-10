export type Job = {
  id: number
  title: string
  location: string | null
  location_short: string
  experience_level: string | null
  experience_label: string | null
  job_type: string
  min_salary: number | null
  max_salary: number | null
  salary_label: string | null
  job_url: string | null
  external_apply: boolean
  created_at: string
  posted_on: string
  company: CompanySummary | null
}

export type CompanySummary = {
  id: number
  name: string
  logo_url: string | null
  headquarter: string | null
  company_type: string | null
}

export type Company = CompanySummary & {
  website: string | null
  founded_year: number | null
  min_size: number | null
  max_size: number | null
  active_jobs_count: number
  location_short: string | null
}

export type Paginated<T> = {
  data: T[]
  meta: {
    page: number
    per_page: number
    total_count: number
    total_pages: number
  }
}

export type JobFilters = {
  search_keywords?: string
  search_location?: string
  job_type?: string
  experience_level?: string
  work_mode?: string
  sort_by?: string
  page?: number
}
