import JobBoard from './components/JobBoard'

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto mt-20 p-6 space-y-10">
      <h1 className="text-2xl font-bold">Job Parser</h1>
      <JobBoard />
    </main>
  )
}