import { SavedUrl } from '../types/job'

interface SavedUrlCardProps {
  saved: SavedUrl
  onScan: (url: string, company: string) => void
  onDelete: (url: string) => void
}

export default function SavedUrlCard({ saved, onScan, onDelete }: SavedUrlCardProps) {
  return (
    <div className="border rounded p-3 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="font-medium text-sm">{saved.company}</p>
        <p className="text-xs text-gray-400 truncate">{saved.url}</p>
        {saved.lastScannedAt && (
          <p className="text-xs text-gray-400">
            Last scanned: {new Date(saved.lastScannedAt).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onScan(saved.url, saved.company)}
          className="text-xs bg-black text-white px-3 py-1 rounded"
        >
          Scan
        </button>
        <button
          onClick={() => onDelete(saved.url)}
          className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  )
}