import { NextResponse } from 'next/server'
import { getAllRooms } from '@/lib/socket/store'

export async function GET() {
  const rooms = getAllRooms()
  const open = rooms
    .filter((r) => r.phase === 'lobby' && r.players.length < 10)
    .map((r) => ({
      code: r.code,
      players: r.players.length,
      max: 10,
      host: r.players.find((p) => p.isHost)?.nickname ?? '—',
    }))
  return NextResponse.json({ rooms: open })
}
