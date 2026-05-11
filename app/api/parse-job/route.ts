import { NextRequest, NextResponse } from 'next/server'
import { parseJob } from '../../lib/parseJob'

export async function POST(request: NextRequest) {
  // 
  const body = await request.json()
  const url: string = body.url

  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    const html = await response.text()
    const job = parseJob(html, url)
    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 })
  }
}