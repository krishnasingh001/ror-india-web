import type {
  AtsCheckReport,
  BlogComment,
  BlogPost,
  BlogPostInput,
  Company,
  DashboardData,
  DeveloperProfile,
  ExternalApplication,
  ExternalApplicationActivity,
  ExternalApplicationComment,
  ExternalApplicationInput,
  ExternalBoardResponse,
  Job,
  JobFilters,
  JobFormInput,
  JobTypeOption,
  Paginated,
  RecruiterApplication,
  RecruiterProfile,
  JobApplicationComment,
  TalentProfile,
  User,
} from '@/types'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api/v1'

let csrfToken: string | null = null

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function clearCsrf() {
  csrfToken = null
}

export async function ensureCsrf(force = false) {
  if (!force && csrfToken) return csrfToken

  // Cross-origin SPAs cannot read the CSRF cookie set by the API host, so always
  // prefer the JSON token from /auth/csrf. Cookie is only useful on same-origin.
  if (!force) {
    const fromCookie = readCookie('CSRF-TOKEN')
    if (fromCookie) {
      csrfToken = fromCookie
      return csrfToken
    }
  }

  const res = await fetch(`${API_BASE}/auth/csrf`, {
    credentials: 'include',
    cache: 'no-store',
  })
  const text = await res.text()
  let data: { csrf_token?: string }
  try {
    data = JSON.parse(text) as { csrf_token?: string }
  } catch {
    throw new Error(
      `Could not load CSRF token (${res.status}). Rails may be down or have pending migrations.`,
    )
  }
  if (!data.csrf_token) {
    throw new Error('CSRF token missing from API response.')
  }
  csrfToken = data.csrf_token
  return csrfToken
}

async function request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const method = (init.method || 'GET').toUpperCase()
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }

  if (method !== 'GET' && method !== 'HEAD') {
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
    const token = await ensureCsrf(retried)
    headers['X-CSRF-Token'] = token
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers,
  })

  const text = await res.text()
  let data: Record<string, unknown> = {}
  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>
    } catch {
      const looksLikeHtml = /^\s*</.test(text)
      throw new Error(
        looksLikeHtml
          ? `API returned HTML instead of JSON (${res.status}). Is Rails running and migrations up to date?`
          : `Invalid JSON response (${res.status})`,
      )
    }
  }

  if (!res.ok) {
    const message =
      (typeof data.message === 'string' && data.message) ||
      (typeof data.error === 'string' && data.error) ||
      `Request failed (${res.status})`

    // Stale CSRF after session rotation — refresh once and retry mutating calls.
    if (
      !retried &&
      method !== 'GET' &&
      method !== 'HEAD' &&
      res.status === 422 &&
      /csrf|authenticity/i.test(message + JSON.stringify(data))
    ) {
      clearCsrf()
      return request<T>(path, init, true)
    }

    const err = new Error(message) as Error & {
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
        ids: filters.ids,
        run_id: filters.run_id,
      })}`,
    ),

  fetchJob: (id: string | number) =>
    request<{ data: Job; similar_jobs: Job[] }>(`/jobs/${id}`),

  fetchMyJobs: (page = 1, perPage = 10) =>
    request<Paginated<Job>>(`/jobs/mine${toQuery({ page, per_page: perPage })}`),

  createJob: (payload: JobFormInput) =>
    request<{ success: boolean; message: string; data: Job; errors?: string[] }>('/jobs', {
      method: 'POST',
      body: JSON.stringify({ job: payload }),
    }),

  updateJob: (id: number | string, payload: JobFormInput) =>
    request<{ success: boolean; message: string; data: Job; errors?: string[] }>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ job: payload }),
    }),

  deleteJob: (id: number | string) =>
    request<{ success: boolean; message: string }>(`/jobs/${id}`, { method: 'DELETE' }),

  fetchJobTypes: () => request<{ data: JobTypeOption[] }>('/job_types'),

  fetchRecruiterApplications: (params: { status?: string; job_id?: number | string; page?: number } = {}) =>
    request<Paginated<RecruiterApplication>>(
      `/recruiter/applications${toQuery({
        status: params.status,
        job_id: params.job_id,
        page: params.page,
      })}`,
    ),

  fetchRecruiterApplicationsBoard: (params: {
    job_id?: number | string
    status?: string
    limit?: number
    offset?: number
  } = {}) =>
    request<{
      data: Record<string, RecruiterApplication[]>
      meta: {
        total_count: number
        statuses: string[]
        totals_by_status?: Record<string, number>
        has_more?: Record<string, boolean>
        limit?: number
        offset?: number
        status?: string | null
      }
    }>(
      `/recruiter/applications/board${toQuery({
        job_id: params.job_id,
        status: params.status,
        limit: params.limit,
        offset: params.offset,
      })}`,
    ),

  fetchRecruiterApplication: (id: number | string) =>
    request<{ data: RecruiterApplication }>(`/recruiter/applications/${id}`),

  rescoreRecruiterApplication: (id: number | string) =>
    request<{ success: boolean; message: string; data: RecruiterApplication }>(
      `/recruiter/applications/${id}/rescore`,
      { method: 'POST' },
    ),

  updateApplicationStatus: (id: number | string, status: string) =>
    request<{ success: boolean; message: string; data: RecruiterApplication }>(
      `/recruiter/applications/${id}/update_status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
    ),

  fetchRecruiterApplicationComments: (applicationId: number | string) =>
    request<{
      data: JobApplicationComment[]
      meta: { comments_count: number }
    }>(`/recruiter/applications/${applicationId}/comments`),

  createRecruiterApplicationComment: (applicationId: number | string, body: string) =>
    request<{
      success: boolean
      data: JobApplicationComment
      meta?: { comments_count: number }
      errors?: Record<string, string[]>
    }>(`/recruiter/applications/${applicationId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment: { body } }),
    }),

  deleteRecruiterApplicationComment: (applicationId: number | string, commentId: number) =>
    request<{
      success: boolean
      meta?: { comments_count: number }
    }>(`/recruiter/applications/${applicationId}/comments/${commentId}`, { method: 'DELETE' }),

  fetchTalentProfiles: (
    params: {
      search?: string
      location?: string
      experience?: string | number
      skills?: string
      company?: string
      page?: number
    } = {},
  ) =>
    request<Paginated<TalentProfile>>(
      `/recruiter/profiles${toQuery({
        search: params.search,
        location: params.location,
        experience: params.experience,
        skills: params.skills,
        company: params.company,
        page: params.page,
      })}`,
    ),

  fetchTalentProfile: (id: number | string) =>
    request<{ data: TalentProfile }>(`/recruiter/profiles/${id}`),

  fetchRecruiterAccount: () =>
    request<{ data: RecruiterProfile; exists: boolean }>('/recruiter/account'),

  updateRecruiterAccount: (form: FormData) =>
    request<{
      success: boolean
      message: string
      data: RecruiterProfile
      user?: User
      errors?: Record<string, string[]>
    }>('/recruiter/account', { method: 'PATCH', body: form }),

  fetchSavedProfiles: (page = 1) =>
    request<Paginated<TalentProfile>>(`/recruiter/saved_profiles${toQuery({ page })}`),

  saveProfile: (developerProfileId: number | string) =>
    request<{ success: boolean; message: string; saved: boolean; data?: TalentProfile }>(
      '/recruiter/saved_profiles',
      {
        method: 'POST',
        body: JSON.stringify({ developer_profile_id: developerProfileId }),
      },
    ),

  unsaveProfile: (developerProfileId: number | string) =>
    request<{ success: boolean; message: string; saved: boolean }>(
      `/recruiter/saved_profiles/${developerProfileId}`,
      { method: 'DELETE' },
    ),

  createCompany: (payload: {
    name: string
    website?: string
    headquarter?: string
    company_type?: string
  }) =>
    request<{ success: boolean; message: string; data: Company; errors?: string[] }>('/companies', {
      method: 'POST',
      body: JSON.stringify({ company: payload }),
    }),

  fetchCompanies: (params: { search?: string; page?: number; per_page?: number } = {}) =>
    request<Paginated<Company>>(
      `/companies${toQuery({ search: params.search, page: params.page, per_page: params.per_page })}`,
    ),
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

  confirmEmail: (confirmation_token: string) =>
    request<{ success: boolean; message: string; redirect_to?: string }>(
      `/auth/confirm${toQuery({ confirmation_token })}`,
    ),

  requestPasswordReset: (email: string) =>
    request<{ success: boolean; message: string }>('/auth/password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  updatePassword: (payload: {
    reset_password_token: string
    password: string
    password_confirmation: string
  }) =>
    request<{ success: boolean; message: string; redirect_to?: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  unsubscribe: (payload: { token?: string; email?: string }) =>
    request<{ success: boolean; message: string }>('/subscriptions/unsubscribe', {
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

  externalApplications: (page = 1) =>
    request<Paginated<ExternalApplication>>(`/external_applications${toQuery({ page })}`),

  externalApplicationsBoard: () =>
    request<ExternalBoardResponse>(`/external_applications${toQuery({ board: 1 })}`),

  createExternalApplication: (payload: ExternalApplicationInput) =>
    request<{
      success: boolean
      message: string
      data: ExternalApplication
      errors?: Record<string, string[]>
      meta?: { counts: Record<string, number>; total_count: number; already_tracked?: boolean }
    }>('/external_applications', {
      method: 'POST',
      body: JSON.stringify({ external_job_application: payload }),
    }),

  trackExternalJob: (jobId: number) =>
    request<{
      success: boolean
      message: string
      data: ExternalApplication
      errors?: Record<string, string[]>
      meta?: { counts: Record<string, number>; total_count: number; already_tracked?: boolean }
    }>('/external_applications', {
      method: 'POST',
      body: JSON.stringify({ external_job_application: { job_id: jobId, status: 'applied' } }),
    }),

  updateExternalApplicationStatus: (id: number, status: string, position?: number) =>
    request<{
      success: boolean
      data: ExternalApplication
      meta?: { counts: Record<string, number>; total_count: number }
      errors?: Record<string, string[]>
    }>(`/external_applications/${id}/update_status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, position }),
    }),

  updateExternalApplication: (id: number, payload: ExternalApplicationInput) =>
    request<{
      success: boolean
      message: string
      data: ExternalApplication
      errors?: Record<string, string[]>
    }>(`/external_applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ external_job_application: payload }),
    }),

  deleteExternalApplication: (id: number) =>
    request<{
      success: boolean
      message: string
      meta?: { counts: Record<string, number>; total_count: number }
    }>(`/external_applications/${id}`, { method: 'DELETE' }),

  externalApplicationComments: (applicationId: number) =>
    request<{
      data: ExternalApplicationComment[]
      meta: { comments_count: number }
    }>(`/external_applications/${applicationId}/comments`),

  createExternalApplicationComment: (applicationId: number, body: string) =>
    request<{
      success: boolean
      data: ExternalApplicationComment
      meta?: { comments_count: number }
      errors?: Record<string, string[]>
    }>(`/external_applications/${applicationId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment: { body } }),
    }),

  deleteExternalApplicationComment: (applicationId: number, commentId: number) =>
    request<{
      success: boolean
      meta?: { comments_count: number }
    }>(`/external_applications/${applicationId}/comments/${commentId}`, { method: 'DELETE' }),

  externalApplicationActivities: (applicationId: number) =>
    request<{
      data: ExternalApplicationActivity[]
      meta: { activities_count: number }
    }>(`/external_applications/${applicationId}/activities`),

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

  subscribe: (email: string) =>
    request<{ success: boolean; message: string }>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ subscription: { email } }),
    }),

  fetchStats: () =>
    request<{
      data: {
        developers: number
        companies: number
        jobs: number
        active_jobs: number
      }
    }>('/stats'),

  fetchBlogPosts: (params: { search?: string; page?: number } = {}) =>
    request<Paginated<BlogPost>>(`/blog_posts${toQuery({ search: params.search, page: params.page })}`),

  fetchBlogPost: (idOrSlug: string | number) =>
    request<{
      data: BlogPost
      meta: {
        related: BlogPost[]
        comments: BlogComment[]
        can_edit: boolean
        can_comment: boolean
      }
    }>(`/blog_posts/${idOrSlug}`),

  fetchMyBlogPosts: (page = 1) =>
    request<
      Paginated<BlogPost> & {
        meta: Paginated<BlogPost>['meta'] & {
          draft_count: number
          published_count: number
          total_posts: number
        }
      }
    >(`/blog_posts/mine${toQuery({ page })}`),

  createBlogPost: (payload: BlogPostInput) => {
    if (payload.featured_image) {
      const form = new FormData()
      form.append('blog_post[title]', payload.title)
      form.append('blog_post[content]', payload.content)
      if (payload.excerpt) form.append('blog_post[excerpt]', payload.excerpt)
      if (payload.slug) form.append('blog_post[slug]', payload.slug)
      if (payload.status) form.append('blog_post[status]', payload.status)
      if (payload.tags_list) form.append('blog_post[tags_list]', payload.tags_list)
      if (payload.meta_title) form.append('blog_post[meta_title]', payload.meta_title)
      if (payload.meta_description) form.append('blog_post[meta_description]', payload.meta_description)
      form.append('blog_post[featured_image]', payload.featured_image)
      return request<{ success: boolean; message: string; data: BlogPost; errors?: Record<string, string[]> }>(
        '/blog_posts',
        { method: 'POST', body: form },
      )
    }
    return request<{ success: boolean; message: string; data: BlogPost; errors?: Record<string, string[]> }>(
      '/blog_posts',
      {
        method: 'POST',
        body: JSON.stringify({
          blog_post: {
            title: payload.title,
            content: payload.content,
            excerpt: payload.excerpt,
            slug: payload.slug,
            status: payload.status,
            tags_list: payload.tags_list,
            meta_title: payload.meta_title,
            meta_description: payload.meta_description,
          },
        }),
      },
    )
  },

  updateBlogPost: (id: number | string, payload: BlogPostInput) => {
    if (payload.featured_image) {
      const form = new FormData()
      form.append('blog_post[title]', payload.title)
      form.append('blog_post[content]', payload.content)
      if (payload.excerpt != null) form.append('blog_post[excerpt]', payload.excerpt)
      if (payload.slug) form.append('blog_post[slug]', payload.slug)
      if (payload.status) form.append('blog_post[status]', payload.status)
      if (payload.tags_list != null) form.append('blog_post[tags_list]', payload.tags_list)
      if (payload.meta_title != null) form.append('blog_post[meta_title]', payload.meta_title)
      if (payload.meta_description != null) form.append('blog_post[meta_description]', payload.meta_description)
      form.append('blog_post[featured_image]', payload.featured_image)
      return request<{ success: boolean; message: string; data: BlogPost; errors?: Record<string, string[]> }>(
        `/blog_posts/${id}`,
        { method: 'PATCH', body: form },
      )
    }
    return request<{ success: boolean; message: string; data: BlogPost; errors?: Record<string, string[]> }>(
      `/blog_posts/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          blog_post: {
            title: payload.title,
            content: payload.content,
            excerpt: payload.excerpt,
            slug: payload.slug,
            status: payload.status,
            tags_list: payload.tags_list,
            meta_title: payload.meta_title,
            meta_description: payload.meta_description,
          },
        }),
      },
    )
  },

  deleteBlogPost: (id: number | string) =>
    request<{ success: boolean; message: string }>(`/blog_posts/${id}`, { method: 'DELETE' }),

  publishBlogPost: (id: number | string) =>
    request<{ success: boolean; message: string; data: BlogPost }>(`/blog_posts/${id}/publish`, {
      method: 'PATCH',
    }),

  createBlogComment: (blogPostId: number | string, content: string, parentId?: number) =>
    request<{ success: boolean; message: string; data: BlogComment; errors?: Record<string, string[]> }>(
      `/blog_posts/${blogPostId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ comment: { content, parent_id: parentId } }),
      },
    ),

  deleteBlogComment: (blogPostId: number | string, commentId: number) =>
    request<{ success: boolean; message: string }>(`/blog_posts/${blogPostId}/comments/${commentId}`, {
      method: 'DELETE',
    }),

  fetchProfile: () =>
    request<{
      data: DeveloperProfile | null
      exists: boolean
      message?: string
      stats?: { applications: number; saved_jobs: number }
    }>('/profile'),

  createProfile: (form: FormData) =>
    request<{ success: boolean; message: string; data: DeveloperProfile; errors?: Record<string, string[]> }>(
      '/profile',
      { method: 'POST', body: form },
    ),

  updateProfile: (form: FormData) =>
    request<{ success: boolean; message: string; data: DeveloperProfile; errors?: Record<string, string[]> }>(
      '/profile',
      { method: 'PATCH', body: form },
    ),

  parseResume: (file: File) => {
    const form = new FormData()
    form.append('resume', file)
    return request<{
      success: boolean
      message: string
      data: Partial<{
        full_name: string
        phone: string
        email: string
        linkedin_profile: string
        github_profile: string
        portfolio_website: string
        current_role: string
        experience: number
        skills: string[]
        preferred_locations: string[]
        city: string
        state: string
        country: string
        current_company: string
        bio: string
        work_experience_details: string[]
        date_of_birth: string
      }>
      meta?: { filename: string; content_type: string; characters: number }
      errors?: Record<string, string[]>
    }>('/profile/parse_resume', { method: 'POST', body: form })
  },

  checkResume: (file: File, targetRole?: string) => {
    const form = new FormData()
    form.append('resume', file)
    if (targetRole?.trim()) form.append('target_role', targetRole.trim())
    return request<{
      success: boolean
      message: string
      data: AtsCheckReport
      meta?: { filename: string; content_type: string; characters: number; bytes: number }
      errors?: Record<string, string[]>
    }>('/resume_checks', { method: 'POST', body: form })
  },
}
