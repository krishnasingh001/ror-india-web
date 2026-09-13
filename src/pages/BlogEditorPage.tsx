import { FormEvent, useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RichTextEditor, isBlankHtml } from '@/components/RichTextEditor'
import { SelectMenu } from '@/components/SelectMenu'
import { api } from '@/lib/api'
import type { BlogPostInput } from '@/types'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

export function BlogEditorPage() {
  const { slug } = useParams()
  const isEdit = Boolean(slug)
  const navigate = useNavigate()

  const [postId, setPostId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [postSlug, setPostSlug] = useState('')
  const [status, setStatus] = useState('draft')
  const [tagsList, setTagsList] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    api
      .fetchBlogPost(slug)
      .then((res) => {
        if (cancelled) return
        if (!res.meta.can_edit) {
          setError('You are not allowed to edit this post.')
          return
        }
        const post = res.data
        setPostId(post.id)
        setTitle(post.title)
        setContent(post.content || '')
        setExcerpt(post.excerpt || '')
        setPostSlug(post.slug)
        setStatus(post.status)
        setTagsList((post.tags || []).join(', '))
        setMetaTitle(post.meta_title || '')
        setMetaDescription(post.meta_description || '')
        setExistingImageUrl(post.featured_image_url)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setFieldErrors({})

    if (isBlankHtml(content)) {
      setError('Please enter content for your blog post.')
      setFieldErrors({ content: ['Content can’t be blank'] })
      setSaving(false)
      return
    }

    const payload: BlogPostInput = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim(),
      slug: postSlug.trim() || undefined,
      status,
      tags_list: tagsList.trim(),
      meta_title: metaTitle.trim(),
      meta_description: metaDescription.trim(),
      featured_image: image,
    }

    try {
      const res =
        isEdit && postId
          ? await api.updateBlogPost(postId, payload)
          : await api.createBlogPost(payload)
      navigate(`/blog/${res.data.slug}`)
    } catch (err) {
      const e2 = err as Error & { payload?: { message?: string; errors?: Record<string, string[]> } }
      setError(e2.payload?.message || e2.message || 'Could not save post')
      if (e2.payload?.errors) setFieldErrors(e2.payload.errors)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    )
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Link to={isEdit ? '/my-blog-posts' : '/blog'} className="text-sm font-semibold text-ink-muted hover:text-brand">
          ← {isEdit ? 'My posts' : 'Blog'}
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink">
          {isEdit ? 'Edit post' : 'Write a blog post'}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Format with headings, lists, links, and code blocks. Switch to Preview anytime.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-lg border border-brand/30 bg-brand-soft/40 px-4 py-3 text-sm text-brand">
              {error}
            </div>
          )}

          <Field label="Title" error={fieldErrors.title?.[0]}>
            <input
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={200}
              placeholder="e.g. How we hire Rails engineers worldwide"
            />
          </Field>

          <Field label="Slug (optional)" error={fieldErrors.slug?.[0]}>
            <input
              className="input-field"
              value={postSlug}
              onChange={(e) => setPostSlug(e.target.value)}
              placeholder="auto-generated-from-title"
              pattern="[a-z0-9\-]*"
            />
          </Field>

          <Field label="Excerpt" error={fieldErrors.excerpt?.[0]}>
            <textarea
              className="input-field min-h-[80px]"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={500}
              placeholder="Short summary shown on the blog index"
            />
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">Content</span>
            <RichTextEditor
              key={isEdit ? `edit-${postId ?? slug}` : 'new'}
              value={content}
              onChange={setContent}
              placeholder="Write your post — use the toolbar for headings, lists, and code blocks…"
            />
            {fieldErrors.content?.[0] && (
              <span className="mt-1 block text-xs text-brand">{fieldErrors.content[0]}</span>
            )}
            <p className="mt-2 text-xs text-ink-muted">
              Tip: select text then use <strong>Code</strong> for inline snippets, or{' '}
              <strong>Code block</strong> for multi-line examples.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-ink">Status</span>
              <SelectMenu value={status} onChange={setStatus} options={STATUS_OPTIONS} />
            </div>
            <Field label="Tags (comma-separated)">
              <input
                className="input-field"
                value={tagsList}
                onChange={(e) => setTagsList(e.target.value)}
                placeholder="rails, careers, india"
              />
            </Field>
          </div>

          <Field label="Featured image">
            {existingImageUrl && !image && (
              <img
                src={existingImageUrl}
                alt=""
                className="mb-3 max-h-40 rounded-lg border border-slate-200 object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </Field>

          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-ink">SEO (optional)</summary>
            <div className="mt-4 space-y-4">
              <Field label="Meta title">
                <input className="input-field" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
              </Field>
              <Field label="Meta description">
                <textarea
                  className="input-field min-h-[80px]"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
              </Field>
            </div>
          </details>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create post'}
            </button>
            <Link to={isEdit ? '/my-blog-posts' : '/blog'} className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-brand">{error}</span>}
    </label>
  )
}
