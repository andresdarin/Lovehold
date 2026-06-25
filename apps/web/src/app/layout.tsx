import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lovehold',
  description: 'Gastos compartidos para parejas',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon.png',
    apple: [
      { url: '/icons/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/icons/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/apple-icon-167x167.png', sizes: '167x167', type: 'image/png' },
      { url: '/icons/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Lovehold',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FF6B6B" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Elms+Sans:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
