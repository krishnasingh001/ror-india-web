import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pagination } from '@/components/Pagination'
import { api } from '@/lib/api'
import type { BlogPost } from '@/types'

export function MyBlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [draftCount, setDraftCount] = useState(0)
  const [publishedCount, setPublishedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load(nextPage = page) {
    setLoading(true)
    setError(null)
    try {
      const res = await api.fetchMyBlogPosts(nextPage)
      setPosts(res.data)
      setTotalPages(res.meta.total_pages)
      setTotalCount(res.meta.total_count)
      setPerPage(res.meta.per_page)
      setDraftCount(res.meta.draft_count)
      setPublishedCount(res.meta.published_count)
      setPage(nextPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onPublish(post: BlogPost) {
    setBusyId(post.id)
    try {
      await api.publishBlogPost(post.id)
      await load(page)
    } finally {
      setBusyId(null)
    }
  }

  async function onDelete(post: BlogPost) {
    if (!confirm(`Delete “${post.title}”?`)) return
    setBusyId(post.id)
    try {
      await api.deleteBlogPost(post.id)
      await load(page)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Writing</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">My blog posts</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {publishedCount} published · {draftCount} drafts
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/blog" className="btn-secondary">
            View blog
          </Link>
          <Link to="/blog/new" className="btn-primary">
            New post
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-ink-muted">{error}</p>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center">
            <p className="text-ink">You haven’t written any posts yet.</p>
            <Link to="/blog/new" className="btn-primary mt-4 inline-flex">
              Write your first post
            </Link>
          </div>
        ) : (
          <ul className="list-none space-y-3 p-0">
            {posts.map((post) => (
              <li
                key={post.id}
                className="card-surface flex flex-wrap items-center justify-between gap-4 p-4 shadow-panel sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`dash-badge dash-badge--${post.status}`}>{post.status}</span>
                    <span className="text-xs text-ink-muted">
                      Updated {new Date(post.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to={post.status === 'published' ? `/blog/${post.slug}` : `/blog/${post.slug}/edit`}
                    className="mt-1 block truncate text-base font-semibold text-ink hover:text-brand"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1 text-xs text-ink-muted">
                    {post.comments_count || 0} comments · /blog/{post.slug}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/blog/${post.slug}`} className="btn-secondary !py-2">
                    View
                  </Link>
                  <Link to={`/blog/${post.slug}/edit`} className="btn-secondary !py-2">
                    Edit
                  </Link>
                  {post.status !== 'published' && (
                    <button
                      type="button"
                      className="btn-primary !py-2"
                      disabled={busyId === post.id}
                      onClick={() => void onPublish(post)}
                    >
                      Publish
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-secondary !py-2 text-brand"
                    disabled={busyId === post.id}
                    onClick={() => void onDelete(post)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              perPage={perPage}
              onChange={(p) => void load(p)}
              label="posts"
            />
          </div>
        )}
      </div>
    </div>
  )
}
