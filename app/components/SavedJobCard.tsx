import { SavedJob } from '../types/job'

interface SavedJobCardProps {
  job: SavedJob
  onDelete: (url: string) => void
}

export default function SavedJobCard({ job, onDelete }: SavedJobCardProps) {
  return (
    <div className="border rounded p-4 space-y-1 text-sm">
      <p><span className="font-semibold">Title:</span> {job.title ?? 'Not found'}</p>
      <p><span className="font-semibold">Company:</span> {job.company ?? 'Not found'}</p>
      <div className="flex items-center gap-3 pt-1">
        <a href={job.url} target="_blank" className="text-blue-500 underline text-xs">
          View posting
        </a>
        <button
          onClick={() => onDelete(job.url)}
          className="text-xs text-red-400 hover:text-red-600"
        >
          Remove
        </button>
      </div>
    </div>
  )
}