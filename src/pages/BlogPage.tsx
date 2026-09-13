import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pagination } from '@/components/Pagination'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { BlogPost } from '@/types'

export function BlogPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(12)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .fetchBlogPosts({ search: query || undefined, page })
      .then((res) => {
        if (!cancelled) {
          setPosts(res.data)
          setTotal(res.meta.total_count)
          setTotalPages(res.meta.total_pages)
          setPerPage(res.meta.per_page)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
          setPosts([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [query, page])

  function onSearch(e: FormEvent) {
    e.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  function goToPage(next: number) {
    setPage(next)
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      <section className="hero-surface">
        <div className="container-page py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Blog</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Rails insights for the world
              </h1>
              <p className="mt-3 max-w-xl text-sm text-ink-muted sm:text-base">
                Tips, hiring notes, and community posts from Ruby on Rails developers.
              </p>
            </div>
            {user && (
              <div className="flex flex-wrap gap-2">
                <Link to="/blog/new" className="btn-primary">
                  Write a post
                </Link>
                <Link to="/my-blog-posts" className="btn-secondary">
                  My posts
                </Link>
              </div>
            )}
          </div>

          <form
            onSubmit={onSearch}
            className="mt-8 flex flex-col gap-2 rounded-xl border border-slate-300 bg-white p-3 shadow-sm sm:flex-row sm:p-4"
            role="search"
            aria-label="Search blog posts"
          >
            <label htmlFor="blog-search" className="sr-only">
              Search blog posts
            </label>
            <input
              id="blog-search"
              className="input-field"
              placeholder="Search posts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn-primary shrink-0 sm:px-6">
              Search
            </button>
          </form>
        </div>
      </section>

      <section ref={listRef} className="container-page scroll-mt-24 py-8 pb-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm">
          <span className="font-semibold text-ink">{loading ? '…' : total}</span>
          <span className="text-ink-muted">{total === 1 ? 'post' : 'posts'}</span>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-ink-muted">{error}</p>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center">
            <p className="text-ink">No posts found.</p>
            {user && (
              <Link to="/blog/new" className="btn-primary mt-4 inline-flex">
                Write the first post
              </Link>
            )}
          </div>
        ) : (
          <ul className="grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <article className="card-surface flex h-full flex-col overflow-hidden shadow-panel transition duration-200 hover:border-brand-border">
                  {post.featured_image_url && (
                    <Link to={`/blog/${post.slug}`} className="block aspect-[16/9] overflow-hidden bg-slate-100">
                      <img
                        src={post.featured_image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </Link>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-medium text-ink-muted">
                      {post.published_on || 'Draft'}
                      {post.author?.name ? ` · ${post.author.name}` : ''}
                      {` · ${post.reading_time} min read`}
                    </p>
                    <h2 className="mt-2 text-lg font-bold tracking-tight text-ink">
                      <Link to={`/blog/${post.slug}`} className="hover:text-brand">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink-muted">{post.excerpt}</p>
                    {post.tags?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="pill">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalCount={total}
              perPage={perPage}
              onChange={goToPage}
              label="posts"
            />
          </div>
        )}
      </section>
    </div>
  )
}
