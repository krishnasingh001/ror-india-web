type BrandLogoProps = {
  className?: string
  /** When false, renders the mark only */
  showWordmark?: boolean
}

/**
 * ROR World lockup — prominent ruby/orbit mark + compact wordmark.
 */
export function BrandLogo({ className = '', showWordmark = true }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 sm:gap-2 ${className}`}>
      <img
        src="/logo-ror-world-mark.png"
        alt=""
        width={72}
        height={72}
        className="h-[3.75rem] w-[3.75rem] shrink-0 scale-110 object-contain object-center sm:h-[4.25rem] sm:w-[4.25rem]"
        aria-hidden
      />
      {showWordmark && (
        <span className="relative z-10 -ml-0.5 whitespace-nowrap text-xs font-bold leading-none tracking-tight sm:text-sm">
          <span className="text-brand">ROR</span>
          <span className="text-ink">World</span>
        </span>
      )}
    </span>
  )
}
