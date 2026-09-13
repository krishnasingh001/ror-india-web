import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { BlogComment, BlogPost } from '@/types'

export function BlogShowPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [related, setRelated] = useState<BlogPost[]>([])
  const [comments, setComments] = useState<BlogComment[]>([])
  const [canEdit, setCanEdit] = useState(false)
  const [canComment, setCanComment] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentBody, setCommentBody] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [commentBusy, setCommentBusy] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!slug) return
    setLoading(true)
    setError(null)
    api
      .fetchBlogPost(slug)
      .then((res) => {
        setPost(res.data)
        setRelated(res.meta.related || [])
        setComments(res.meta.comments || [])
        setCanEdit(res.meta.can_edit)
        setCanComment(res.meta.can_comment)
      })
      .catch((err: Error) => {
        setError(err.message)
        setPost(null)
      })
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    load()
  }, [load])

  async function onComment(e: FormEvent) {
    e.preventDefault()
    if (!post || !commentBody.trim()) return
    if (!user) return navigate('/sign-in', { state: { from: `/blog/${post.slug}` } })
    setCommentBusy(true)
    setCommentError(null)
    try {
      await api.createBlogComment(post.id, commentBody.trim(), replyTo || undefined)
      setCommentBody('')
      setReplyTo(null)
      const res = await api.fetchBlogPost(post.slug)
      setComments(res.meta.comments || [])
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Could not post comment')
    } finally {
      setCommentBusy(false)
    }
  }

  async function onDeleteComment(commentId: number) {
    if (!post || !confirm('Delete this comment?')) return
    await api.deleteBlogComment(post.id, commentId)
    const res = await api.fetchBlogPost(post.slug)
    setComments(res.meta.comments || [])
  }

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container-page py-16">
        <p className="text-ink-muted">{error || 'Post not found'}</p>
        <Link to="/blog" className="mt-4 inline-block text-brand">
          Back to blog
        </Link>
      </div>
    )
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <Link to="/blog" className="text-sm font-semibold text-ink-muted hover:text-brand">
        ← All posts
      </Link>

      <article className="mx-auto mt-6 max-w-3xl">
        {post.status !== 'published' && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            This post is a {post.status}. Only you can see it.
          </p>
        )}

        <header>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-ink-muted">
            <span>{post.published_on || 'Unpublished'}</span>
            <span>·</span>
            <span>{post.author?.name || 'Author'}</span>
            <span>·</span>
            <span>{post.reading_time} min read</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-base text-ink-muted sm:text-lg">{post.excerpt}</p>}
          {canEdit && (
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`/blog/${post.slug}/edit`} className="btn-secondary !py-2">
                Edit post
              </Link>
              <Link to="/my-blog-posts" className="btn-secondary !py-2">
                My posts
              </Link>
            </div>
          )}
          {post.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.featured_image_url && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <img src={post.featured_image_url} alt="" className="w-full object-cover" />
          </div>
        )}

        <div
          className="job-desc-html mt-10"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        <section className="mt-14 border-t border-slate-200 pt-10">
          <h2 className="text-lg font-bold tracking-tight text-ink">
            Comments {comments.length > 0 ? `(${countComments(comments)})` : ''}
          </h2>

          {canComment || user ? (
            <form onSubmit={onComment} className="mt-5 space-y-3">
              {replyTo && (
                <p className="text-xs text-ink-muted">
                  Replying to a comment.{' '}
                  <button type="button" className="font-semibold text-brand" onClick={() => setReplyTo(null)}>
                    Cancel
                  </button>
                </p>
              )}
              <textarea
                className="input-field min-h-[100px]"
                placeholder="Share your thoughts…"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                required
                minLength={2}
              />
              {commentError && <p className="text-sm text-brand">{commentError}</p>}
              <button type="submit" disabled={commentBusy} className="btn-primary">
                {commentBusy ? 'Posting…' : 'Post comment'}
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">
              <Link to="/sign-in" state={{ from: `/blog/${post.slug}` }} className="font-semibold text-brand">
                Sign in
              </Link>{' '}
              to leave a comment.
            </p>
          )}

          <ul className="mt-8 list-none space-y-5 p-0">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={(id) => {
                  setReplyTo(id)
                  setCommentBody('')
                }}
                onDelete={(id) => void onDeleteComment(id)}
              />
            ))}
          </ul>
          {comments.length === 0 && (
            <p className="mt-6 text-sm text-ink-muted">No comments yet. Start the discussion.</p>
          )}
        </section>

        {related.length > 0 && (
          <section className="mt-14 border-t border-slate-200 pt-10">
            <h2 className="text-lg font-bold tracking-tight text-ink">Related posts</h2>
            <ul className="mt-5 grid list-none gap-4 p-0 sm:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/blog/${item.slug}`}
                    className="card-surface block h-full p-4 shadow-panel transition hover:border-brand-border"
                  >
                    <p className="text-xs text-ink-muted">{item.published_on}</p>
                    <p className="mt-1 font-semibold text-ink">{item.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  )
}

function countComments(comments: BlogComment[]): number {
  return comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0)
}

function CommentItem({
  comment,
  onReply,
  onDelete,
  nested = false,
}: {
  comment: BlogComment
  onReply: (id: number) => void
  onDelete: (id: number) => void
  nested?: boolean
}) {
  return (
    <li className={nested ? 'ml-6 border-l border-slate-200 pl-4' : ''}>
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
          {comment.user.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-sm font-semibold text-ink">{comment.user.name || 'User'}</p>
            <p className="text-xs text-ink-muted">{comment.created_ago}</p>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{comment.content}</p>
          <div className="mt-2 flex gap-3 text-xs font-semibold">
            {!nested && (
              <button type="button" className="text-brand hover:underline" onClick={() => onReply(comment.id)}>
                Reply
              </button>
            )}
            {comment.can_delete && (
              <button type="button" className="text-ink-muted hover:text-brand" onClick={() => onDelete(comment.id)}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      {comment.replies?.length > 0 && (
        <ul className="mt-4 list-none space-y-4 p-0">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} onDelete={onDelete} nested />
          ))}
        </ul>
      )}
    </li>
  )
}
