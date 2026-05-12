interface UrlInputProps {
  url: string
  company: string
  loading: boolean
  onUrlChange: (value: string) => void
  onCompanyChange: (value: string) => void
  onScan: () => void
}

export default function UrlInput({
  url,
  company,
  loading,
  onUrlChange,
  onCompanyChange,
  onScan
}: UrlInputProps) {
  return (
  <section className="space-y-2">
      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Paste a careers page URL..."
        className="w-full border rounded p-2 text-sm"
      />
      <input
        type="text"
        value={company}
        onChange={(e) => onCompanyChange(e.target.value)}
        placeholder="Company name (optional)..."
        className="w-full border rounded p-2 text-sm"
      />
      <button
        onClick={() => onScan()}
        disabled={ loading || url.trim() === ''}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Scanning...' : 'Scan Page'}
      </button>
    </section>
  )
}