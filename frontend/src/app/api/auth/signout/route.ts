import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = cookies()
  cookieStore.delete('auth-token')
  return Response.json({ success: true })
}
