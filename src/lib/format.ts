const AVATAR_PALETTES = [
  { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-100' },
  { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-100' },
  { bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-100' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-100' },
  { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-100' },
  { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-100' },
  { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-100' },
  { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-100' },
  { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', ring: 'ring-fuchsia-100' },
  { bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-200' },
] as const

export function companyInitial(name: string) {
  return (name?.trim()?.[0] || '?').toUpperCase()
}

export function companyAvatarTone(name: string) {
  const key = name.trim().toLowerCase() || '?'
  let hash = 0
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return AVATAR_PALETTES[hash % AVATAR_PALETTES.length]
}
