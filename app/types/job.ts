export interface JobPosting {
  title: string | null;
  company: string | null;
  url: string;
}
export interface JobLink{
  url: string;
  label: string;
  parsing?: boolean
  parsed?: JobPosting
}

export interface SavedUrl {
  url: string
  company: string
  addedAt: number
}

export interface SavedJob {
  title: string | null
  company: string | null
  url: string
  savedAt: number
}