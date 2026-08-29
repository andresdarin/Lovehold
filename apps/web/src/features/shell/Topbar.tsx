interface TopbarProps {
  profile: {
    displayName: string | null
    email: string
    color: string
    avatarUrl?: string | null
  } | null
}

/**
 * Topbar responsiva.
 * En mobile actúa como cabecera principal con el logo y controles.
 * En desktop se oculta ya que el Sidebar se encarga de la identidad y navegación.
 */
export default function Topbar({ profile }: TopbarProps) {
  const userInitial = (profile?.displayName?.[0] ?? profile?.email[0] ?? '?').toUpperCase()
  const initials = profile?.displayName 
    ? profile.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : userInitial

  return (
    <header className="sticky top-0 left-0 right-0 flex h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] items-center justify-between bg-surface/85 backdrop-blur-xl border-b border-border px-6 lg:hidden z-20 transition-colors">
      {/* Identidad de Marca */}
      <div className="flex items-center gap-2.5 select-none">
        <img
          src="/brand/finnic-symbol-navy.png"
          alt="Finnic logo"
          className="h-6 w-6 object-contain"
        />
        <span className="text-base font-bold tracking-tight text-foreground">
          Finnic
        </span>
      </div>

      {/* Controles / Perfil */}
      <div className="flex items-center gap-3">
        {/* Campana de Notificaciones */}
        <button 
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-soft border border-border/60 hover:bg-surface-alt text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          title="Notificaciones"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>

        {profile && (
          <div className="relative shrink-0 select-none">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-white text-xs shadow-sm overflow-hidden ring-1 ring-border"
              style={{ 
                background: `linear-gradient(135deg, ${profile.color ?? '#083A4F'}ee, ${profile.color ?? '#083A4F'})` 
              }}
              title={profile.displayName ?? profile.email}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName ?? 'Foto de perfil'}
                  className="h-full w-full rounded-full object-cover block shrink-0"
                />
              ) : (
                <span className="drop-shadow-sm text-[11px] font-bold tracking-wide">{initials}</span>
              )}
            </div>
            {/* Indicador de estado */}
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-warning ring-2 ring-surface" />
          </div>
        )}
      </div>
    </header>
  )
}
