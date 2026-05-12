"use client";

import { useState, useEffect } from "react";
import { JobPosting, JobLink, SavedUrl, SavedJob } from "./types/job";
import { loadFromStorage, saveToStorage, KEYS } from "./lib/storage";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [links, setLinks] = useState<JobLink[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const [mounted, setMounted] = useState<boolean>(false);
  const [savedUrls, setSavedUrls] = useState<SavedUrl[]> (() => loadFromStorage<SavedUrl[]>(KEYS.savedUrls, []));
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(() => loadFromStorage<SavedJob[]>(KEYS.savedJobs, []));

  // useEffect(() => {
    // setMounted(true);
    // setSavedUrls();
    // setSavedJobs();
  // }, []);

  async function handleScan(scanUrl = url, scanCompany = company) {
    setLoading(true);
    setError(null);
    setLinks([]);

    try {
      const response = await fetch("/api/scan-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scanUrl }),
      });

      const data: JobLink[] = await response.json();
      setLinks(data);

      // Save URL if not already saved
      const already = savedUrls.find((s) => s.url === scanUrl);
      if (already) {
        // Update lastScannedAt on existing entry
        const updated = savedUrls.map((s) =>
          s.url === scanUrl ? { ...s, lastScannedAt: Date.now() } : s,
        );
        setSavedUrls(updated);
        saveToStorage<SavedUrl[]>(KEYS.savedUrls, updated);
      } else if (scanCompany) {
        // Add new entry
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

      const savedJob: SavedJob = {
        ...enriched,
        savedAt: Date.now(),
      };
      const updatedJobs = [
        savedJob,
        ...savedJobs.filter((j) => j.url !== jobUrl),
      ];
      setSavedJobs(updatedJobs);
      saveToStorage<SavedJob[]>(KEYS.savedJobs, updatedJobs);

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
      {savedUrls.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Saved Pages</h2>
          <div className="space-y-2">
            {savedUrls.map((saved) => (
              <div
                key={saved.url}
                className="border rounded p-3 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm">{saved.company}</p>
                  <p className="text-xs text-gray-400 truncate">{saved.url}</p>
                  {saved.lastScannedAt && (
                    <p className="text-xs text-gray-400">
                      Last scanned:{" "}
                      {new Date(saved.lastScannedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleScan(saved.url, saved.company)}
                    className="text-xs bg-black text-white px-3 py-1 rounded"
                  >
                    Scan
                  </button>
                  <button
                    onClick={() => handleDeleteUrl(saved.url)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
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
              <div key={link.url} className="border rounded p-4 space-y-2">
                <p className="font-medium text-sm">{link.label}</p>
                <p className="text-xs text-gray-400 truncate">{link.url}</p>
                {link.parsed ? (
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="font-semibold">Title:</span>{" "}
                      {link.parsed.title ?? "Not found"}
                    </p>
                    <p>
                      <span className="font-semibold">Company:</span>{" "}
                      {link.parsed.company ?? "Not found"}
                    </p>
                    <a
                      href={link.url}
                      target="_blank"
                      className="text-blue-500 underline text-xs"
                    >
                      View posting
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => handleParse(link.url)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    {link.parsing ? "Parsing..." : "Parse"}
                  </button>
                )}
              </div>
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
              <div
                key={job.url}
                className="border rounded p-4 space-y-1 text-sm"
              >
                <p>
                  <span className="font-semibold">Title:</span>{" "}
                  {job.title ?? "Not found"}
                </p>
                <p>
                  <span className="font-semibold">Company:</span>{" "}
                  {job.company ?? "Not found"}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href={job.url}
                    target="_blank"
                    className="text-blue-500 underline text-xs"
                  >
                    View posting
                  </a>
                  <button
                    onClick={() => handleDeleteJob(job.url)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
