import { NextRequest, NextResponse } from 'next/server';

const CORRECT_PASSWORD = 'sporka2025';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === CORRECT_PASSWORD) {
      const response = NextResponse.json({ success: true });

      // Set session cookie (expires in 24 hours)
      response.cookies.set('session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400, // 24 hours
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json({ success: false, error: 'Nesprávné heslo' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Chyba serveru' }, { status: 500 });
  }
}
