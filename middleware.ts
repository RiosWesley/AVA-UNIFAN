import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas protegidas e suas roles correspondentes
const protectedRoutes = {
  '/aluno': 'student',
  '/professor': 'teacher',
  '/coordenador': 'coordinator',
  '/administrador': 'admin',
} as const

// Rotas públicas (não requerem autenticação)
const publicRoutes = ['/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se a rota é pública
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Verificar se é uma rota protegida
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Para rotas protegidas, deixar o RouteGuard no cliente fazer a verificação
  // O middleware apenas permite a requisição passar
  // A verificação real de autenticação e role será feita pelo RouteGuard
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

