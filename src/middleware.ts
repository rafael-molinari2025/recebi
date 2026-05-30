import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignorar rotas estáticas e webhooks
  if (
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/lembretes') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Usa getUser (valida JWT no servidor Supabase — seguro para decisões de auth)
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/cadastro')
  const isApiRoute = pathname.startsWith('/api')
  const isPublicPage = pathname === '/' || pathname.startsWith('/sobre') || pathname.startsWith('/precos')

  if (!user && !isAuthPage && !isApiRoute && !isPublicPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|public).*)'],
}
