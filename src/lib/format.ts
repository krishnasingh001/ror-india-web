export function companyInitial(name: string) {
  return (name?.trim()?.[0] || '?').toUpperCase()
}
