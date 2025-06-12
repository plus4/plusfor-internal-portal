import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setParentDomainJWTCookie, shouldSetParentDomainCookie } from '@/lib/utils/auth-cookie'

export async function POST() {
  try {
    if (!shouldSetParentDomainCookie()) {
      return NextResponse.json({ success: false, message: 'Parent domain cookie is not enabled' })
    }

    const supabase = await createClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.access_token) {
      return NextResponse.json({ success: false, message: 'No valid session found' })
    }

    const cookieHeader = setParentDomainJWTCookie(
      session.access_token,
      session.expires_at
    )

    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', cookieHeader)

    return response
  } catch (error) {
    console.error('Error setting parent domain cookie:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}