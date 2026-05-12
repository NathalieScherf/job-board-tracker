import { JobLink, JobPosting, SavedJob } from '../types/job'

interface JobLinkCardProps {
  link: JobLink
  isSaved: boolean
  onParse: (url: string) => void
  onSave: (job: JobPosting) => void
}

export default function JobLinkCard({ link, isSaved, onParse, onSave }: JobLinkCardProps) {
  return (
    <div className="border rounded p-4 space-y-2">
      <p className="font-medium text-sm">{link.label}</p>
      <p className="text-xs text-gray-400 truncate">{link.url}</p>

      {link.parsed ? (
        <div className="mt-2 space-y-1 text-sm">
          <p><span className="font-semibold">Title:</span> {link.parsed.title ?? 'Not found'}</p>
          <p><span className="font-semibold">Company:</span> {link.parsed.company ?? 'Not found'}</p>
          <div className="flex items-center gap-3 pt-1">
            <a href={link.url} target="_blank" className="text-blue-500 underline text-xs">
              View posting
            </a>
            <button
              onClick={() => onSave(link.parsed!)}
              disabled={isSaved}
              className="text-xs bg-black text-white px-3 py-1 rounded disabled:opacity-50"
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => onParse(link.url)}
          className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
        >
          {link.parsing ? 'Parsing...' : 'Parse'}
        </button>
      )}
    </div>
  )
}