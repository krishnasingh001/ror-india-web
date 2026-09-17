export type User = {
  id: number
  name: string
  email: string
  role: 'candidate' | 'recruiter' | 'admin' | string
  avatar: string | null
  confirmed: boolean
  has_profile: boolean
  can_apply_directly: boolean
}

export type Job = {
  id: number
  title: string
  location: string | null
  location_short: string
  experience_level: string | null
  experience_label: string | null
  seniority?: string | null
  job_type: string
  job_type_id?: string | number | null
  company_id?: number | null
  min_salary: number | null
  max_salary: number | null
  salary_label: string | null
  job_url: string | null
  external_apply: boolean
  created_at: string
  posted_on: string
  posted_label?: string | null
  description_html?: string | null
  description?: string | null
  skills?: string[]
  company: CompanySummary | null
  saved?: boolean
  applied?: boolean
  active?: boolean
  email?: string | null
  application_deadline?: string | null
  applications_count?: number
  views_count?: number
}

export type JobTypeOption = {
  id: number
  name: string
}

export type JobFormInput = {
  title: string
  description: string
  job_type_id?: string | number | null
  location?: string
  min_salary?: number | string | null
  max_salary?: number | string | null
  experience_level?: string
  application_deadline?: string | null
  email?: string
  company_id?: number | string | null
  active?: boolean
  skills_required?: string
}

export type RecruiterProfile = {
  id: number | null
  full_name: string | null
  email: string | null
  job_title: string | null
  phone: string | null
  company_name: string | null
  location: string | null
  linkedin_url: string | null
  website: string | null
  bio: string | null
  avatar_url: string | null
  profile_picture_url: string | null
}

export type RecruiterApplicationStatus =
  | 'applied'
  | 'reviewing'
  | 'shortlisted'
  | 'rejected'
  | 'hired'

export type RecruiterApplication = {
  id: number
  status: RecruiterApplicationStatus | string
  status_display: string
  applied_at: string | null
  applied_ago: string | null
  created_at: string
  comments_count?: number | null
  candidate: {
    id: number
    name: string | null
    email: string | null
    avatar: string | null
    profile_id: number | null
    phone?: string | null
    current_role?: string | null
    current_company?: string | null
    location?: string | null
    experience?: number | null
  }
  job: Job
  profile?: TalentProfile | null
}

export type JobApplicationComment = {
  id: number
  body: string
  user_id: number
  user_name: string | null
  user_initials: string
  created_at: string
  created_ago: string
  can_delete: boolean
}

export type TalentProfile = {
  id: number
  full_name: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  location?: string | null
  experience?: number | null
  current_role?: string | null
  current_company?: string | null
  skills?: string[]
  profile_picture_url?: string | null
  open_to_recruiters?: boolean
  saved?: boolean
  phone?: string | null
  bio?: string | null
  career_summary?: string | null
  preferred_locations?: string[]
  notice_period?: string | null
  job_type?: string | null
  shift_preference?: string | null
  linkedin_profile?: string | null
  github_profile?: string | null
  portfolio_website?: string | null
  work_experience_details?: string[]
  highest_qualification?: string | null
  university?: string | null
  graduation_year?: number | null
  expected_ctc_label?: string | null
  resume?: ProfileAttachment | null
  saved_at?: string | null
  saved_profile_id?: number
}

export type CompanySummary = {
  id: number
  name: string
  logo_url: string | null
  headquarter: string | null
  company_type: string | null
  website?: string | null
  followed?: boolean
}

export type Company = CompanySummary & {
  website: string | null
  linkedin_url?: string | null
  career_page_url?: string | null
  founded_year: number | null
  min_size: number | null
  max_size: number | null
  active_jobs_count: number | null
  followers_count?: number | null
  location_short: string | null
  followed?: boolean
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
  ids?: string
  run_id?: string | number
}

export type ApplicationItem = {
  id: number
  status?: string
  status_display?: string
  created_at: string
  applied_at?: string | null
  applied_ago?: string | null
  job: Job
}

export type ExternalApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offered'
  | 'rejected'
  | 'withdrawn'

export type ExternalApplicationSource =
  | 'linkedin'
  | 'indeed'
  | 'naukri'
  | 'company_website'
  | 'referral'
  | 'other'

export type ExternalApplication = {
  id: number
  job_title: string
  company_name: string
  status: ExternalApplicationStatus | string
  status_display: string
  source: ExternalApplicationSource | string
  source_display: string
  job_url: string | null
  location: string | null
  notes?: string | null
  position?: number
  comments_count?: number
  applied_at: string | null
  applied_ago: string | null
  applied_on?: string | null
}

export type ExternalBoardMeta = {
  total_count: number
  statuses: ExternalApplicationStatus[]
  sources: ExternalApplicationSource[]
  status_labels: Record<string, string>
  source_labels: Record<string, string>
}

export type ExternalBoardResponse = {
  data: Record<string, ExternalApplication[]>
  meta: ExternalBoardMeta
}

export type ExternalApplicationInput = {
  job_id?: number
  company_name?: string
  job_title?: string
  job_url?: string
  source?: string
  status?: string
  applied_at?: string
  location?: string
  notes?: string
}

export type ExternalApplicationComment = {
  id: number
  body: string
  user_id: number
  user_name: string | null
  user_initials: string
  created_at: string
  created_ago: string
  can_delete: boolean
}

export type ExternalApplicationActivity = {
  id: number
  kind: 'created' | 'status_change' | string
  from_value: string | null
  to_value: string | null
  from_label: string | null
  to_label: string | null
  message: string
  user_id: number
  user_name: string | null
  user_initials: string
  created_at: string
  created_ago: string
}

export type BlogPostSummary = {
  id: number
  title: string
  slug: string
  status: string
  created_at: string
  created_on: string
}

export type BlogAuthor = {
  id: number
  name: string | null
}

export type BlogPost = {
  id: number
  title: string
  slug: string
  excerpt: string
  content?: string
  status: string
  tags: string[]
  author: BlogAuthor
  featured_image_url: string | null
  published_at: string | null
  published_on: string | null
  reading_time: number
  created_at: string
  updated_at: string
  comments_count?: number
  can_edit?: boolean
  meta_title?: string
  meta_description?: string
}

export type BlogComment = {
  id: number
  content: string
  parent_id: number | null
  user: {
    id: number
    name: string | null
    initials: string
  }
  created_at: string
  created_ago: string
  can_delete: boolean
  replies: BlogComment[]
}

export type BlogPostInput = {
  title: string
  content: string
  excerpt?: string
  slug?: string
  status?: string
  tags_list?: string
  meta_title?: string
  meta_description?: string
  featured_image?: File | null
}

export type ProfileAttachment = {
  filename: string
  content_type: string
  byte_size: number
  url: string
}

export type DeveloperProfile = {
  id: number
  full_name: string
  email: string
  phone: string | null
  city: string | null
  state: string | null
  country: string | null
  location: string | null
  experience: number | null
  current_role: string | null
  bio: string | null
  career_summary: string | null
  skills: string[]
  preferred_locations: string[]
  current_company: string | null
  current_ctc: number | null
  expected_ctc: number | null
  current_ctc_label: string
  expected_ctc_label: string
  notice_period: string | null
  job_type: string | null
  shift_preference: string | null
  date_of_birth: string | null
  linkedin_profile: string | null
  github_profile: string | null
  portfolio_website: string | null
  work_experience_details: string[]
  highest_qualification: string | null
  university: string | null
  graduation_year: number | null
  profile_completion: number
  resume: ProfileAttachment | null
  profile_picture_url: string | null
  open_to_recruiters: boolean
}

export type AtsCheckItem = {
  id: string
  label: string
  status: 'pass' | 'fail' | 'warn'
  detail: string
  impact: number
}

export type AtsCheckCategory = {
  id: string
  label: string
  score: number
  points_to_gain: number
  checks: AtsCheckItem[]
}

export type AtsCheckReport = {
  overall_score: number
  summary: string
  passed_count: number
  failed_count: number
  total_checks: number
  filename?: string | null
  target_role?: string | null
  categories: AtsCheckCategory[]
}

export type DashboardData = {
  role: string
  user: User
  greeting?: string
  features?: {
    external_job_applications?: boolean
  }
  stats: {
    applications?: number
    external_applications?: number
    saved_jobs?: number
    followed_companies?: number
    profile_completion?: number
    posted_jobs?: number
    pending_applications?: number
    open_profiles?: number
    saved_profiles?: number
  }
  recent_applications?: ApplicationItem[] | RecruiterApplication[]
  recent_external_applications?: ExternalApplication[]
  recent_saved_jobs?: Array<{ id: number; created_at: string; job: Job }>
  followed_companies?: Company[]
  recent_blog_posts?: BlogPostSummary[]
  recent_jobs?: Job[]
}
