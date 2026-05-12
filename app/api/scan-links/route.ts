import { NextRequest, NextResponse } from 'next/server'
import { extractJobLinks } from '../../lib/extractLinks'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const url: string = body.url

  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    const html = await response.text()
    const links = extractJobLinks(html, url)
    return NextResponse.json(links)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch URL', details: error }, { status: 500 })
  }
}