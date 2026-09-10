export function compactLocation(location?: string | null, length = 28) {
  if (!location?.trim()) return 'Remote'
  const primary = location
    .split(/[;|]/)
    .map((s) => s.trim())
    .filter(Boolean)[0]
    ?.replace(/\s*[-–]\s*(Hybrid|Remote)\s*$/i, '')
    .trim()

  const value = primary || 'Remote'
  return value.length > length ? `${value.slice(0, length - 1)}…` : value
}

export function companyInitial(name: string) {
  return (name?.trim()?.[0] || '?').toUpperCase()
}
