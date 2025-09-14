import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { NotificationSystem } from "@/components/advanced/notification-system"
import { AIChatbot } from "@/components/advanced/ai-chatbot"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Smart Tourist Safety & Incident Response System",
  description: "Ultra-modern safety platform for tourists, police, hotels, and airports",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Suspense fallback={null}>
            <AuthProvider>
              {children}
              <NotificationSystem />
              <AIChatbot />
            </AuthProvider>
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
