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

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_AVATAR_SIZE = 2 * 1024 * 1024

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return 'Solo se permiten imágenes JPG, PNG o WebP'
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return 'La imagen no puede superar los 2MB'
  }
  return null
}

export function getAvatarFileExtension(file: File): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  return map[file.type] ?? 'jpg'
}

export function buildAvatarPath(userId: string, file: File): string {
  return `${userId}/avatar.${getAvatarFileExtension(file)}`
}
