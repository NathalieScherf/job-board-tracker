import * as cheerio from 'cheerio'
import { JobPosting } from '../types/job'
// :string and :url sets types of arguments, :JobPosting means the function must return a JobPosting object
export function parseJob(html: string, url: string): JobPosting {
  const $ = cheerio.load(html)

  // Remove noise. Variable name is $ because it's a common convention when using cheerio, and it allows us to use jQuery-like syntax to manipulate the HTML
  $('script, style, nav, footer, header').remove()

  // Try to find the job title
  const title =   $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || 
     'No title found'

  // Try to find the company name
  const company =
  $('meta[property="og:site_name"]').attr('content') ||
    $('[class*="company"]').first().text().trim() ||
    $('[class*="employer"]').first().text().trim() ||
    $('[class*="organization"]').first().text().trim() ||
     
    $('meta[name="author"]').attr('content') ||
    null

  return { title, company, url }
}