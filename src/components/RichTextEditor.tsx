import { useCallback, useState, type ReactNode } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeightClass?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your post…',
  minHeightClass = 'min-h-[320px]',
}: RichTextEditorProps) {
  const [tab, setTab] = useState<'editor' | 'preview'>('editor')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: {
          HTMLAttributes: {
            class: 'language-plaintext',
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand underline underline-offset-2',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
    editorProps: {
      attributes: {
        class: [
          'rich-editor-body outline-none',
          minHeightClass,
          'px-4 py-3 text-sm leading-relaxed text-ink',
        ].join(' '),
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', previous || 'https://')
    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }, [editor])

  const insertCodeBlock = useCallback(() => {
    if (!editor) return
    editor.chain().focus().toggleCodeBlock().run()
  }, [editor])

  if (!editor) {
    return <div className={`animate-pulse rounded-xl border border-slate-300 bg-white ${minHeightClass}`} />
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 px-2 py-1.5">
        <div className="flex flex-wrap items-center gap-0.5">
          <ToolbarBtn
            label="Bold"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <span className="font-bold">B</span>
          </ToolbarBtn>
          <ToolbarBtn
            label="Italic"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <span className="italic">I</span>
          </ToolbarBtn>
          <ToolbarBtn
            label="Underline"
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <span className="underline">U</span>
          </ToolbarBtn>
          <ToolbarBtn
            label="Strike"
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <span className="line-through">S</span>
          </ToolbarBtn>

          <ToolbarSep />

          <ToolbarBtn
            label="Heading 2"
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </ToolbarBtn>
          <ToolbarBtn
            label="Heading 3"
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </ToolbarBtn>

          <ToolbarSep />

          <ToolbarBtn
            label="Bullet list"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListIcon />
          </ToolbarBtn>
          <ToolbarBtn
            label="Numbered list"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <OrderedListIcon />
          </ToolbarBtn>
          <ToolbarBtn
            label="Quote"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            “ ”
          </ToolbarBtn>

          <ToolbarSep />

          <ToolbarBtn
            label="Inline code"
            active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            {'</>'}
          </ToolbarBtn>
          <ToolbarBtn
            label="Code block"
            active={editor.isActive('codeBlock')}
            onClick={insertCodeBlock}
          >
            <CodeBlockIcon />
          </ToolbarBtn>
          <ToolbarBtn label="Link" active={editor.isActive('link')} onClick={setLink}>
            <LinkIcon />
          </ToolbarBtn>

          <ToolbarSep />

          <ToolbarBtn
            label="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            ↶
          </ToolbarBtn>
          <ToolbarBtn
            label="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            ↷
          </ToolbarBtn>
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
          <button
            type="button"
            className={`rounded-md px-2.5 py-1 transition ${
              tab === 'editor' ? 'bg-brand-soft text-brand' : 'text-ink-muted hover:text-ink'
            }`}
            onClick={() => setTab('editor')}
          >
            Editor
          </button>
          <button
            type="button"
            className={`rounded-md px-2.5 py-1 transition ${
              tab === 'preview' ? 'bg-brand-soft text-brand' : 'text-ink-muted hover:text-ink'
            }`}
            onClick={() => setTab('preview')}
          >
            Preview
          </button>
        </div>
      </div>

      {tab === 'editor' ? (
        <EditorContent editor={editor} />
      ) : (
        <div
          className={`job-desc-html px-4 py-3 ${minHeightClass}`}
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-ink-muted">Nothing to preview yet.</p>' }}
        />
      )}
    </div>
  )
}

function ToolbarBtn({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={[
        'inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-1.5 text-xs font-semibold transition',
        active ? 'bg-brand-soft text-brand' : 'text-slate-600 hover:bg-white hover:text-ink',
        disabled ? 'cursor-not-allowed opacity-40' : '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function ToolbarSep() {
  return <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:inline-block" aria-hidden="true" />
}

function ListIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" strokeLinecap="round" />
    </svg>
  )
}

function OrderedListIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10 6h10M10 12h10M10 18h10M4 6h1v4M4 10h2M4 16h2v2H4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CodeBlockIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M8 8 4 12l4 4M16 8l4 4-4 4M14 4l-4 16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93M14 11a5 5 0 0 0-7.07 0L5.52 12.4a5 5 0 0 0 7.07 7.07L14 18.07"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function isBlankHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim() === ''
}
