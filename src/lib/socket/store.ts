import type { Room } from '@/lib/game/types'

declare global {
  // eslint-disable-next-line no-var
  var __stop_rooms: Map<string, Room> | undefined
}

const rooms: Map<string, Room> = global.__stop_rooms ?? (global.__stop_rooms = new Map())

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
