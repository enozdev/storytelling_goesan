import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  console.log('Middleware triggered for path:', url.pathname);

  // 정확한 경로만 보호
  if (url.pathname === '/quiz/quizList') {
    const sessionId = request.cookies.get('adminSession')?.value;
    console.log('Session ID from cookie:', sessionId);

    if (!sessionId) {
      console.log('No session found, redirecting to login');
      return NextResponse.redirect(new URL('/adminLogin', request.url));
    }

    // 세션이 있는 경우에만 진행
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/quiz/quizList',
}; 