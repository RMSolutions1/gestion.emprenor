import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'

export const dynamic = "force-dynamic";

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'Emprenor Servicios — Gestion de Obras',
  description: 'Canal cliente y proveedor: documentacion de obra y personal, consultas y justificaciones con trazabilidad',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  icons: {
    icon: '/brand/logo-icon-inverted.png',
    shortcut: '/brand/logo-icon-inverted.png',
    apple: '/brand/logo-icon-inverted.png',
  },
  openGraph: {
    title: 'Emprenor Servicios — Gestion de Obras',
    description: 'Plataforma operativa Emprenor Nexus para obras industriales y civiles',
    images: ['/og-image.png'],
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
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className={`${dmSans.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} font-sans`}>
        <Providers>
          {children}
          <Toaster />
          <ChunkLoadErrorHandler />
        </Providers>
      </body>
    </html>
  )
}
