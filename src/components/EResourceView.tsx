/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Download, FileText, BookOpen, Search, ArrowUpRight, HelpCircle, GraduationCap } from "lucide-react";
import { EResource } from "../types.ts";

interface EResourceViewProps {
  eresources: EResource[];
  onTriggerDownload: (id: string) => Promise<void>;
}

export default function EResourceView({ eresources, onTriggerDownload }: EResourceViewProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const categories = ["All", "Textbook", "Research Paper", "Open-Source PDF"];

  const filtered = eresources.filter((er) => {
    const matchQuery =
      er.title.toLowerCase().includes(search.toLowerCase()) ||
      er.author.toLowerCase().includes(search.toLowerCase()) ||
      er.description.toLowerCase().includes(search.toLowerCase());

    const matchCat = activeCategory === "All" || er.category === activeCategory;
    return matchQuery && matchCat;
  });

  const handleDownload = async (id: string, fileName: string) => {
    setDownloadingId(id);
    try {
      await onTriggerDownload(id);
      // Simulate file download trigger securely inside iframe preview limits
      alert(`Simulated secured asset download triggered for "${fileName}". Digital Membership logs updated.`);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-900/10 p-6 shadow-xs" id="eresource-section">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-amber-500/10">
        <div>
          <h2 className="text-xl font-bold text-emerald-950 font-sans tracking-tight">
            E-Resource & Academic Repository
          </h2>
          <p className="text-xs text-emerald-800 font-medium">
            Lightweight access to open-source West African textbooks, past examination syllabi, and local historic PDF papers.
          </p>
        </div>
        <div className="bg-emerald-700/5 px-2.5 py-1 text-emerald-800 font-bold rounded-lg text-xs mt-2 sm:mt-0 inline-flex items-center gap-1 border border-emerald-700/10 self-start">
          <GraduationCap className="h-3.5 w-3.5 text-emerald-700" />
          <span>W.A.S.S.C.E Syllabus Integrated</span>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
        <div className="relative md:col-span-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-emerald-750/50" />
          </span>
          <input
            id="resource-search-input"
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-emerald-950 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:bg-white"
            placeholder="Search academic papers, texts, authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="md:col-span-6 flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              id={`cat-btn-${cat.toLowerCase().replace(/\s+/g, "-")}`}
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer duration-100 ${
                activeCategory === cat
                  ? "bg-emerald-750 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Eresources */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-amber-50/20 rounded-xl border border-dashed border-amber-900/10">
          <HelpCircle className="h-8 w-8 text-amber-800/40 mx-auto mb-2.5 animate-pulse" />
          <h4 className="text-xs font-semibold text-emerald-950">No e-resources match filtering</h4>
          <p className="text-[10px] text-slate-500 mt-1">Try relaxing search terms or selecting 'All' Categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((er) => (
            <div
              key={er.id}
              id={`resource-card-${er.id}`}
              className="p-4 bg-slate-50/20 hover:bg-slate-50/65 border border-slate-100 rounded-xl flex items-start gap-4 transition duration-150"
            >
              <div className="bg-emerald-700/5 text-emerald-750 p-3 rounded-lg flex items-center justify-center shrink-0 border border-emerald-700/10">
                <FileText className="h-6 w-6 stroke-[1.5]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <span className="text-[9px] uppercase font-mono tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                    {er.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{er.fileSize}</span>
                </div>

                <h4 className="font-bold text-sm text-emerald-950 mt-1 mb-0.5 leading-snug">
                  {er.title}
                </h4>
                <p className="text-[11px] text-slate-600 font-mono">
                  {er.author} ({er.year})
                </p>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed h-8">
                  {er.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Download stats */}
                  <span className="text-[10px] text-emerald-900 font-mono bg-amber-50 px-1.5 py-0.2 rounded font-bold">
                    Downloads: {er.downloads} counters
                  </span>

                  {/* Secure Simulated Download Trigger */}
                  <button
                    id={`download-trigger-${er.id}`}
                    onClick={() => handleDownload(er.id, er.title)}
                    disabled={downloadingId === er.id}
                    className="inline-flex items-center gap-1 font-bold text-emerald-850 hover:text-emerald-900 text-xs cursor-pointer hover:underline disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{downloadingId === er.id ? "Securing API..." : "Download PDF"}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
