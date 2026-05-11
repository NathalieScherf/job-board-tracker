'use client'

import { useState , useEffect} from 'react'
import { JobPosting, JobLink } from './types/job'

export default function Home() {
  const [url, setUrl] = useState<string>('')
  const [links, setLinks] = useState<JobLink[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState<string>('')
  const [mounted, setMounted] = useState<boolean>(false)

    useEffect(() => {
      setMounted(true)
  }, [])
  async function handleScan() {
    setLoading(true)
    setError(null)
    setLinks([])

    try {
      const response = await fetch('/api/scan-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      const data: JobLink[] = await response.json()
      console.log('parsed company:', data.company)  // add this
      setLinks(data)
    } catch (err) {
      setError('Failed to scan page. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleParse(jobUrl: string) {
      console.log('company value:', company)  // add this
    setLinks(prev =>
      prev.map(link =>
        link.url === jobUrl ? { ...link, parsing: true } : link
      )
    )

  try {
    const response = await fetch('/api/parse-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: jobUrl })
    })

    const data: JobPosting = await response.json()

    // Use user-provided company if parser couldn't find one
 const enriched: JobPosting = {
  ...data,
  company: data.company && !['stellen', 'jobs', 'careers', 'karriere'].includes(data.company.toLowerCase().trim())
    ? data.company
    : company || null
}

    setLinks(prev =>
      prev.map(link =>
        link.url === jobUrl ? { ...link, parsed: enriched, parsing: false } : link
      )
    )
  } catch (err) {
    setLinks(prev =>
      prev.map(link =>
        link.url === jobUrl ? { ...link, parsing: false } : link
      )
    )
  }
  }

  return (
    <main className="max-w-2xl mx-auto mt-20 p-6">
      <h1 className="text-2xl font-bold mb-6">Job Parser</h1>

      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a careers page URL..."
        className="w-full border rounded p-2 mb-4 text-sm"
      />

<input
  type="text"
  value={company}
  onChange={(e) => setCompany(e.target.value)}
  placeholder="Company name (optional)..."
  className="w-full border rounded p-2 mb-4 text-sm"
/>

      <button
        onClick={handleScan}
  disabled={!mounted || loading || url.trim() === ''}        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Scanning...' : 'Scan Page'}
      </button>

      {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

      {links.length > 0 && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-gray-500">{links.length} job links found</p>

          {links.map((link) => (
            <div key={link.url} className="border rounded p-4 space-y-2">
              <p className="font-medium text-sm">{link.label}</p>
              <p className="text-xs text-gray-400 truncate">{link.url}</p>

              {link.parsed ? (
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-semibold">Title:</span> {link.parsed.title ?? 'Not found'}</p>
                  <p><span className="font-semibold">Company:</span> {link.parsed.company ?? 'Not found'}</p>
                  <a
                    href={link.url}
                    target="_blank"
                    className="text-blue-500 underline text-xs"
                  > View posting
                  </a>
                </div>
              ) : (
                <button
                  onClick={() => handleParse(link.url)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                >
                  {link.parsing ? 'Parsing...' : 'Parse'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}