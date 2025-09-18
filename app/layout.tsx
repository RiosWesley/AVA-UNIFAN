import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "AVA - Ambiente Virtual de Aprendizagem",
  description: "Sistema de Gestão de Aprendizagem",
  generator: "v0.app",
}

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-sans", 
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap"
})
const jetBrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono", 
  weight: ["400", "500", "600", "700"],
  display: "swap"
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${plusJakarta.variable} ${jetBrainsMono.variable}`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={["light", "dark", "liquid-glass"]}
          storageKey="ava-theme"
        >
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
