import { randomBytes } from 'crypto'

export function getRandomString(length: number): string {
  return randomBytes(length).toString('hex')
}
