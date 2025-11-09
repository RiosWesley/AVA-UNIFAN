import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { InitialPageLoader } from "@/components/layout/initial-page-loader"
import { LoadingOverlay } from "@/components/layout/loading-overlay"
import { Toaster } from "@/components/ui/toaster"
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
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes spin{to{transform:rotate(360deg)}}
              @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
              @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
              @keyframes bounce{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(.8,0,1,1)}50%{transform:translateY(0);animation-timing-function:cubic-bezier(0,0,.2,1)}}
              html.dark #initial-loading{background:#0f172a !important}
              html.dark #initial-loading p{color:#f1f5f9 !important}
            `,
          }}
        />
      </head>
      <body className={`font-sans ${plusJakarta.variable} ${jetBrainsMono.variable}`} suppressHydrationWarning>
        <div
          id="initial-loading"
          suppressHydrationWarning
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "8rem",
                  height: "8rem",
                  border: "4px solid rgba(34,197,94,.2)",
                  borderRadius: "9999px",
                  animation: "ping 2s infinite",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "6rem",
                  height: "6rem",
                  border: "4px solid rgba(34,197,94,.2)",
                  borderRadius: "9999px",
                  animation: "ping 2s infinite",
                  animationDelay: "0.5s",
                }}
              />
            </div>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "5rem",
                  height: "5rem",
                  border: "4px solid rgba(34,197,94,.2)",
                  borderRadius: "9999px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "4px solid transparent",
                    borderTopColor: "#22c55e",
                    borderRadius: "9999px",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  style={{
                    width: "2rem",
                    height: "2rem",
                    color: "#22c55e",
                    animation: "pulse 2s infinite",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 10v6M2 10l10-5 10 5M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <div
              style={{
                marginTop: "2rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  animation: "pulse 2s infinite",
                }}
              >
                Carregando...
              </p>
              <div style={{ display: "flex", gap: "0.25rem" }}>
                <div
                  style={{
                    width: "0.5rem",
                    height: "0.5rem",
                    background: "#22c55e",
                    borderRadius: "9999px",
                    animation: "bounce 1s infinite",
                  }}
                />
                <div
                  style={{
                    width: "0.5rem",
                    height: "0.5rem",
                    background: "#22c55e",
                    borderRadius: "9999px",
                    animation: "bounce 1s infinite",
                    animationDelay: "0.2s",
                  }}
                />
                <div
                  style={{
                    width: "0.5rem",
                    height: "0.5rem",
                    background: "#22c55e",
                    borderRadius: "9999px",
                    animation: "bounce 1s infinite",
                    animationDelay: "0.4s",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var path = window.location.pathname;
                if (path === '/' || path === '') {
                  var loading = document.getElementById('initial-loading');
                  if (loading) loading.remove();
                  return;
                }
              })();
            `,
          }}
        />
        <LoadingOverlay />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={["light", "dark", "liquid-glass"]}
          storageKey="ava-theme"
        >
          <QueryProvider>
            <InitialPageLoader>
              <Suspense fallback={null}>{children}</Suspense>
            </InitialPageLoader>
            <Analytics />
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
