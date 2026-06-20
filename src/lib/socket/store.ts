import type { Room } from '@/lib/game/types'

const rooms = new Map<string, Room>()

export function getRoom(code: string): Room | undefined {
  return rooms.get(code)
}

export function setRoom(room: Room): void {
  rooms.set(room.code, room)
}

export function deleteRoom(code: string): void {
  rooms.delete(code)
}

export function getAllRooms(): Room[] {
  return Array.from(rooms.values())
}
