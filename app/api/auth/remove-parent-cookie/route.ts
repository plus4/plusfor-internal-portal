import { NextResponse } from 'next/server'
import { removeParentDomainJWTCookie, shouldSetParentDomainCookie } from '@/lib/utils/auth-cookie'

export async function POST() {
  try {
    if (!shouldSetParentDomainCookie()) {
      return NextResponse.json({ success: false, message: 'Parent domain cookie is not enabled' })
    }

    const cookieHeader = removeParentDomainJWTCookie()

    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', cookieHeader)

    return response
  } catch (error) {
    console.error('Error removing parent domain cookie:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}