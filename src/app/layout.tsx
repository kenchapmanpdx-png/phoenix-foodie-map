import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/layout/BottomNav'
import SmoothScroll from '@/components/shared/SmoothScroll'
import CustomCursor from '@/components/shared/CustomCursor'
import ClientLayoutShell from '@/components/shared/ClientLayoutShell'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Phoenix Foodie Map',
  description: "Discover Phoenix's best restaurants through local food creators",
  icons: {
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfairDisplay.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Phoenix Foodie Map" />
      </head>
      <body className="bg-surface-primary text-text-primary font-body dark">
        <SmoothScroll>
          <CustomCursor />
          <ClientLayoutShell>{children}</ClientLayoutShell>
          <BottomNav />
        </SmoothScroll>
      </body>
    </html>
  )
}
