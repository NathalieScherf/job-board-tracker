"use client";

import { useState } from "react";
import { JobPosting, JobLink, SavedUrl, SavedJob } from "./types/job";
import { loadFromStorage, saveToStorage, KEYS } from "./lib/storage";
import JobLinkCard from "./components/JobLinkCard";
import SavedJobCard from "./components/SavedJobCard";
import SavedUrlCard from "./components/SavedUrlCard";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [links, setLinks] = useState<JobLink[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedUrls, setSavedUrls] = useState<SavedUrl[]>(() =>
    loadFromStorage<SavedUrl[]>(KEYS.savedUrls, []),
  );
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(() =>
    loadFromStorage<SavedJob[]>(KEYS.savedJobs, []),
  );

  async function handleScan(scanUrl = url, scanCompany = company) {
    setLoading(true);
    setError(null);
    setLinks([]);
    setCompany(scanCompany);

    try {
      const response = await fetch("/api/scan-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scanUrl }),
      });

      const data: JobLink[] = await response.json();
      setLinks(data);

      const already = savedUrls.find((s) => s.url === scanUrl);
      if (already) {
        const updated = savedUrls.map((s) =>
          s.url === scanUrl ? { ...s, lastScannedAt: Date.now() } : s,
        );
        setSavedUrls(updated);
        saveToStorage<SavedUrl[]>(KEYS.savedUrls, updated);
      } else if (scanCompany) {
        const newEntry: SavedUrl = {
          url: scanUrl,
          company: scanCompany,
          addedAt: Date.now(),
          lastScannedAt: Date.now(),
        };
        const updated = [newEntry, ...savedUrls];
        setSavedUrls(updated);
        saveToStorage<SavedUrl[]>(KEYS.savedUrls, updated);
      }
    } catch (err) {
      setError("Failed to scan page. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleParse(jobUrl: string) {
    setLinks((prev) =>
      prev.map((link) =>
        link.url === jobUrl ? { ...link, parsing: true } : link,
      ),
    );

    try {
      const response = await fetch("/api/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      });

      const data: JobPosting = await response.json();

      const enriched: JobPosting = {
        ...data,
        company:
          data.company &&
          !["stellen", "jobs", "careers", "karriere"].includes(
            data.company.toLowerCase().trim(),
          )
            ? data.company
            : company || null,
      };
      setLinks((prev) =>
        prev.map((link) =>
          link.url === jobUrl
            ? { ...link, parsed: enriched, parsing: false }
            : link,
        ),
      );
    } catch (err) {
      setLinks((prev) =>
        prev.map((link) =>
          link.url === jobUrl ? { ...link, parsing: false } : link,
        ),
      );
    }
  }

  function handleSaveJob(job: JobPosting) {
    const savedJob: SavedJob = {
      ...job,
      savedAt: Date.now(),
    };
    const updatedJobs = [
      savedJob,
      ...savedJobs.filter((j) => j.url !== job.url),
    ];
    setSavedJobs(updatedJobs);
    saveToStorage<SavedJob[]>(KEYS.savedJobs, updatedJobs);
  }

  function handleDeleteUrl(urlToDelete: string) {
    const updated = savedUrls.filter((s) => s.url !== urlToDelete);
    setSavedUrls(updated);
    saveToStorage<SavedUrl[]>(KEYS.savedUrls, updated);
  }

  function handleDeleteJob(urlToDelete: string) {
    const updated = savedJobs.filter((j) => j.url !== urlToDelete);
    setSavedJobs(updated);
    saveToStorage<SavedJob[]>(KEYS.savedJobs, updated);
  }

  return (
    <main className="max-w-2xl mx-auto mt-20 p-6 space-y-10">
      <h1 className="text-2xl font-bold">Job Parser</h1>

      <section className="space-y-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a careers page URL..."
          className="w-full border rounded p-2 text-sm"
        />
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company name (optional)..."
          className="w-full border rounded p-2 text-sm"
        />
        <button
          onClick={() => handleScan()}
          // disabled={!mounted || loading || url.trim() === ""}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Scanning..." : "Scan Page"}
        </button>
      </section>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Saved URLs */}
      {savedUrls.length > 0 && (<section>
          <h2 className="text-lg font-semibold mb-3">Saved Job Pages</h2>
          <div className="space-y-2">
            {savedUrls.map((saved) => (
              <SavedUrlCard
                key={saved.url}
                saved={saved}
                onScan={handleScan}
                onDelete={handleDeleteUrl}
              />
            ))}
          </div>
        </section>
      )}

      {/* Scanned Job Links */}
      {links.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">
            {links.length} Jobs Found
          </h2>
          <div className="space-y-3">
            {links.map((link) => (
              <JobLinkCard
                key={link.url}
                link={link}
                isSaved={savedJobs.some((j) => j.url === link.url)}
                onParse={handleParse}
                onSave={handleSaveJob}
              />
            ))}
          </div>
        </section>
      )}

      {/* Saved Jobs */}
      {savedJobs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Saved Jobs</h2>
          <div className="space-y-3">
            {savedJobs.map((job) => (
              <SavedJobCard
                key={job.url}
                job={job}
                onDelete={handleDeleteJob}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
