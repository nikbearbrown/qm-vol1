import { NextResponse } from 'next/server'
import { join } from 'path'
import { isAdmin } from '@/lib/admin-auth'
import { scanHtmlSubdirs } from '@/lib/html-meta'

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const groups = scanHtmlSubdirs(join(process.cwd(), 'public', 'dev'))
  return NextResponse.json({ groups })
}
