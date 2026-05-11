import * as cheerio from 'cheerio'
import { JobLink } from '../types/job'

const JOB_KEYWORDS = [
  'job', 'career', 'position', 'role', 'vacancy',
  'opening', 'hire', 'recruit', 'apply', 'work-with-us',
  'stellen', 'jobs', 'karriere' 
]

function looksLikeJobLink(url: string, label: string): boolean {
  const combined = (url + ' ' + label).toLowerCase()
  return JOB_KEYWORDS.some(keyword => combined.includes(keyword))
}

export function extractJobLinks(html: string, baseUrl: string): JobLink[] {
  const $ = cheerio.load(html)
  const base = new URL(baseUrl)
  const seen = new Set<string>()
  const links: JobLink[] = []

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    const label = $(el).text().trim()

    if (!label || label.length < 3) return
    if (href.startsWith('#')) return          // skip anchor links
    if (href.startsWith('mailto:')) return    // skip email links
    if (href.startsWith('tel:')) return       // skip phone links
    if (!/[a-zA-Z]/.test(label)) return 

    // Resolve relative URLs like /jobs/engineer to full URLs
    let fullUrl: string
    try {
      fullUrl = new URL(href, base).toString()
    } catch {
      return
    }

    // Skip external links
    if (new URL(fullUrl).hostname !== base.hostname) return
    if (new URL(fullUrl).pathname === '/') return
const pathname = new URL(fullUrl).pathname

// Skip homepage
if (pathname === '/') return

// Skip generic listing pages — paths that end with a generic keyword and nothing else
const GENERIC_SLUGS = ['jobs', 'job', 'careers', 'career', 'stellen', 'karriere', 'vacancies', 'openings']
const pathParts = pathname.replace(/^\/|\/$/g, '').split('/')

if (pathParts.length === 1 && GENERIC_SLUGS.includes(pathParts[0].toLowerCase())) return

    // Skip duplicates
    if (seen.has(fullUrl)) return
    seen.add(fullUrl)

    if (looksLikeJobLink(fullUrl, label)) {
      links.push({ url: fullUrl, label })
    }
  })

  return links
}