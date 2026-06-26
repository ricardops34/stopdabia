import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ error: 'no token' })
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
    return NextResponse.json({ email: payload.email, user_metadata_email: payload.user_metadata?.email, sub: payload.sub })
  } catch (e) {
    return NextResponse.json({ error: String(e) })
  }
}
