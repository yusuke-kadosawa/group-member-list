import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { cookies } from 'next/headers'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const token = typeof searchParams.token === 'string' ? searchParams.token : null
  if (!token) {
    return <div>Invalid token</div>
  }

  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token, expires: { gt: new Date() } }
    })
    if (!verificationToken) {
      return <div>Invalid or expired token</div>
    }

    let user = await prisma.user.findFirst({ where: { email: verificationToken.identifier } })
    if (!user) {
      user = await prisma.user.create({ data: { uid: verificationToken.identifier, email: verificationToken.identifier, name: verificationToken.identifier.split('@')[0] } })
    }

    // Create session
    const sessionToken = randomUUID()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await prisma.session.create({ data: { sessionToken, userId: user.id, expires } })

    // Delete verification token
    await prisma.verificationToken.delete({ where: { token } })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('next-auth.session-token', sessionToken, { httpOnly: true, path: '/', expires })

    redirect('/home')
  } catch (e) {
    console.error('verify error', e)
    return <div>Server error</div>
  }
}