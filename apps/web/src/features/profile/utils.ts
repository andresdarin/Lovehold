export function getInitial(name: string | null | undefined, email: string | undefined): string {
  return (name?.[0] ?? email?.[0] ?? '?').toUpperCase()
}

export function formatMemberSince(createdAt: string | undefined): string {
  if (!createdAt) return ''
  const date = new Date(createdAt)
  const months = [
    'Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.',
    'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.',
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
