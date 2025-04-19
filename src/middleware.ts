import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Implementa aquí tu lógica de autenticación personalizada
  // Por ejemplo, verificando tokens JWT, cookies específicas, etc.
  
  // Por ahora, simplemente permitimos todas las solicitudes
  return NextResponse.next()
  
  // Ejemplo de redirección para rutas protegidas:
  /*
  const isAuthenticated = false; // Reemplaza con tu lógica de autenticación
  
  if (!isAuthenticated && 
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/public')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
  */
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto las que comienzan con:
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imágenes)
     * - favicon.ico (archivo de favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 