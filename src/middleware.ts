import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 보호된 페이지 목록
const protectedPaths = [
  '/quizList',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // 보호된 페이지에 접근하는 경우에만 인증 체크
  if (protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
    const adminSession = request.cookies.get('adminSession')?.value;

    if (!adminSession) {
      return NextResponse.redirect(new URL('/adminLogin', request.url));
    }

    try {
      const sessionData = JSON.parse(adminSession);
      if (Date.now() > sessionData.expiresAt) {
        // 세션이 만료된 경우
        return NextResponse.redirect(new URL('/adminLogin', request.url));
      }
    } catch (error) {
      // 세션 데이터가 유효하지 않은 경우
      return NextResponse.redirect(new URL('/adminLogin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/quizList/:path*'],
}; 