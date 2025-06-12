import { serialize, parse } from 'cookie'

const JWT_COOKIE_NAME = 'sb-jwt'
const PARENT_DOMAIN = process.env.NEXT_PUBLIC_SHARED_AUTH_DOMAIN || ''
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

interface CookieOptions {
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  httpOnly?: boolean
  path?: string
  expires?: Date
  maxAge?: number
}

export function setParentDomainJWTCookie(token: string, expiresAt?: number): string {
  const options: CookieOptions = {
    domain: PARENT_DOMAIN,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    httpOnly: true,
    path: '/',
  }

  if (expiresAt) {
    options.expires = new Date(expiresAt * 1000)
  } else {
    options.maxAge = 60 * 60 * 24 * 7
  }

  return serialize(JWT_COOKIE_NAME, token, options)
}

export function removeParentDomainJWTCookie(): string {
  const options: CookieOptions = {
    domain: PARENT_DOMAIN,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    httpOnly: true,
    path: '/',
    expires: new Date(0),
  }

  return serialize(JWT_COOKIE_NAME, '', options)
}

export function getJWTFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  
  const cookies = parse(cookieHeader)
  return cookies[JWT_COOKIE_NAME] || null
}

export function shouldSetParentDomainCookie(): boolean {
  return !!PARENT_DOMAIN
}