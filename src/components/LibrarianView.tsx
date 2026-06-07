/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Check, ShieldAlert, AlertTriangle, Send, RefreshCw, Landmark, Cpu, BarChart3, Bookmark, CheckSquare, Plus, CheckCircle, Tag } from "lucide-react";
import { Book, Loan, Member } from "../types.ts";

interface LibrarianViewProps {
  books: Book[];
  loans: Loan[];
  members: Member[];
  onRefreshAll: () => Promise<void>;
  onCheckInBook: (bookId: string) => Promise<any>;
  onCheckOutBook: (bookId: string, barcode: string) => Promise<any>;
  onSendSMSReminder: (loanId: string) => Promise<void>;
  onAddBook: (book: { title: string; author: string; genre: string; shelf: string; isbn: string }) => Promise<void>;
}

export default function LibrarianView({
  books,
  loans,
  members,
  onRefreshAll,
  onCheckInBook,
  onCheckOutBook,
  onSendSMSReminder,
  onAddBook,
}: LibrarianViewProps) {
  // Check-out fields
  const [coBookId, setCoBookId] = useState("");
  const [coBarcode, setCoBarcode] = useState("");
  
  // Check-in field
  const [ciBookId, setCiBookId] = useState("");

  // Add Book fields
  const [nbTitle, setNbTitle] = useState("");
  const [nbAuthor, setNbAuthor] = useState("");
  const [nbGenre, setNbGenre] = useState("African Fiction");
  const [nbShelf, setNbShelf] = useState("Shelf A1");
  const [nbIsbn, setNbIsbn] = useState("");

  // Test suite states
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const [notif, setNotif] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-set checkout values based on selection
  const handleSelectCheckoutHelp = (bId: string) => {
    setCoBookId(bId);
    setNotif({ type: "success", text: `Selected Book ${bId} for Checkout scanning.` });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coBookId || !coBarcode) {
      setNotif({ type: "error", text: "Fulfill both target book selection and student card barcode." });
      return;
    }

    setSubmitting(true);
    setNotif(null);
    try {
      await onCheckOutBook(coBookId, coBarcode);
      setNotif({ type: "success", text: `Checkout transaction completed successfully for Barcode ${coBarcode}!` });
      setCoBookId("");
      setCoBarcode("");
    } catch (err: any) {
      setNotif({ type: "error", text: err.message || "Failed to complete checkout." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ciBookId) {
      setNotif({ type: "error", text: "Select or input a Book ID for check-in scanning." });
      return;
    }

    setSubmitting(true);
    setNotif(null);
    try {
      const res = await onCheckInBook(ciBookId);
      let text = `Book check-in registered. Core inventory state set to Available.`;
      if (res.fineApplied > 0) {
        text += ` Overdue fine of ¢${res.fineApplied.toFixed(2)} automatically logged to borrower card account.`;
      }
      setNotif({ type: "success", text });
      setCiBookId("");
    } catch (err: any) {
      setNotif({ type: "error", text: err.message || "Could not register check-in." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nbTitle || !nbAuthor || !nbShelf || !nbIsbn) {
      setNotif({ type: "error", text: "Complete all fields to index target book." });
      return;
    }

    setSubmitting(true);
    setNotif(null);
    try {
      await onAddBook({
        title: nbTitle,
        author: nbAuthor,
        genre: nbGenre,
        shelf: nbShelf,
        isbn: nbIsbn,
      });
      setNotif({ type: "success", text: `Indexed "${nbTitle}" into catalog, assigned storage spot ${nbShelf}.` });
      setNbTitle("");
      setNbAuthor("");
      setNbIsbn("");
    } catch (err: any) {
      setNotif({ type: "error", text: "Failed to create book in catalog." });
    } finally {
      setSubmitting(false);
    }
  };

  const executeSMSReminder = async (loanId: string, title: string) => {
    try {
      await onSendSMSReminder(loanId);
      setNotif({ type: "success", text: `SMS warning deadline dispatch signal sent for "${title}".` });
      setTimeout(() => setNotif(null), 4000);
    } catch (err: any) {
      setNotif({ type: "error", text: "Failed to fire reminder service check." });
    }
  };

  // Automated Integration Dev Test Runner
  const runBackendTestsSim = async () => {
    setIsRunningTests(true);
    setTestResults(null);
    try {
      const response = await fetch("/api/dev/run-tests", { method: "POST" });
      const data = await response.json();
      setTestResults(data);
    } catch (err: any) {
      alert("Error calling REST dev test suite: " + err.message);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Custom data visualization calculation
  const genresCountMap: { [key: string]: number } = {};
  books.forEach((b) => {
    genresCountMap[b.genre] = (genresCountMap[b.genre] || 0) + 1;
  });
  const sortedGenresStats = Object.keys(genresCountMap).map((key) => ({
    genre: key,
    count: genresCountMap[key],
  }));

  const overdueLoans = loans.filter((l) => l.status === "Overdue" || books.find((b) => b.id === l.bookId)?.status === "Overdue");

  return (
    <div className="bg-white rounded-2xl border border-amber-900/10 p-6 shadow-xs" id="librarian-admin-section">
      {/* Overview Head */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-6 border-b border-amber-500/10">
        <div>
          <h2 className="text-xl font-bold text-emerald-950 font-sans tracking-tight">
            Librarian Administrative Desk
          </h2>
          <p className="text-xs text-emerald-800 font-medium">
            Scan circulation check-out/ins, track active catalog overdues, and audit backend algorithmic unit rules.
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-3 md:mt-0">
          <button
            id="run-unit-tests-btn"
            onClick={runBackendTestsSim}
            disabled={isRunningTests}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-950 text-amber-100 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Cpu className="h-3.5 w-3.5 text-amber-400" />
            <span>{isRunningTests ? "Simulating Algorithmic Tests..." : "Run REST Tests Console"}</span>
          </button>
          
          <button
            id="refresh-all-btn"
            onClick={onRefreshAll}
            className="text-emerald-950 bg-amber-50 border border-amber-100 hover:bg-amber-100/50 p-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer"
            title="Force Catalog Sync"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {notif && (
        <div
          className={`p-4 rounded-xl text-xs mb-6 border ${
            notif.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-900"
              : "bg-rose-50 border-rose-100 text-rose-900"
          }`}
          role="alert"
        >
          <span><b>Status Alert:</b> {notif.text}</span>
        </div>
      )}

      {/* Retro Dev Unit Tests Console output */}
      {testResults && (
        <div className="mb-6 bg-slate-950 text-slate-100 p-5 rounded-xl border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="text-emerald-400 font-bold block">🚨 Takoradi LMS REST Unit Testing Engine API</span>
            <button
              id="clear-tests-results"
              onClick={() => setTestResults(null)}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Close Console [X]
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">Timestamp: {testResults.timestamp} | Sandbox: Node Express Node.js</p>
          <div className="space-y-2">
            {testResults.testResults.map((tr: any, idx: number) => (
              <div key={idx} className="bg-slate-900 p-2 rounded border border-slate-850">
                <div className="flex justify-between font-bold">
                  <span className="text-white">{tr.testName}</span>
                  <span className={tr.status === "PASS" ? "text-emerald-400" : "text-rose-400"}>
                    {tr.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{tr.message}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-850 text-right text-[10px] text-amber-300 font-bold">
            🔥 ALL API CHECKS PASSED: {testResults.allPass ? "YES (3/3 Rest Constraints)" : "Failing Rules"}
          </div>
        </div>
      )}

      {/* Dashboard Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-emerald-50/20 p-4 rounded-xl border border-slate-100 text-center">
          <span className="text-slate-500 text-[10px] uppercase font-mono block">Catalog Books</span>
          <span className="text-2xl font-bold text-emerald-950">{books.length}</span>
          <span className="text-[10px] text-emerald-800 block mt-1 font-mono">Physical copies on-site</span>
        </div>

        <div className="bg-amber-50/15 p-4 rounded-xl border border-slate-100 text-center">
          <span className="text-slate-500 text-[10px] uppercase font-mono block">Active Loans</span>
          <span className="text-2xl font-bold text-amber-900">
            {loans.filter((l) => l.status === "Active").length}
          </span>
          <span className="text-[10px] text-amber-800 block mt-1 font-mono">Issued to active student IDs</span>
        </div>

        <div className="bg-rose-50/20 p-4 rounded-xl border border-slate-100 text-center">
          <span className="text-slate-500 text-[10px] uppercase font-mono block">Overdues Tracking</span>
          <span className="text-2xl font-bold text-rose-700">{overdueLoans.length}</span>
          <span className="text-[10px] text-rose-800 block mt-1 font-mono">Fee penalties active</span>
        </div>

        <div className="bg-sky-50/10 p-4 rounded-xl border border-slate-100 text-center">
          <span className="text-slate-500 text-[10px] uppercase font-mono block">Registered Members</span>
          <span className="text-2xl font-bold text-sky-900">{members.length}</span>
          <span className="text-[10px] text-sky-800 block mt-1 font-mono">Custom barcodes printed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Check-In/Check-Out scanner console */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Check-Out Simulation */}
          <div className="bg-amber-50/10 p-5 rounded-xl border border-amber-900/5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-900 font-bold mb-3 flex items-center">
              <Check className="h-4 w-4 mr-1 text-emerald-700" />
              <span>Simulate Checkout Scan</span>
            </h3>

            <form onSubmit={handleCheckoutSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-emerald-950 uppercase mb-1">
                  1. Scan / Input Book ID
                </label>
                <input
                  id="checkout-book-id"
                  type="text"
                  placeholder="e.g., b1, b5, or from lists"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  value={coBookId}
                  onChange={(e) => setCoBookId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-emerald-950 uppercase mb-1">
                  2. Scan Patron Barcode ID
                </label>
                <input
                  id="checkout-barcode-id"
                  type="text"
                  placeholder="e.g., TAK-58291"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  value={coBarcode}
                  onChange={(e) => setCoBarcode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <button
                id="submit-checkout-scan"
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg p-2 text-xs font-bold cursor-pointer"
              >
                {submitting ? "Writing ledger..." : "Confirm Checkout"}
              </button>
            </form>
          </div>

          {/* Quick Check-In Simulation */}
          <div className="bg-emerald-50/10 p-5 rounded-xl border border-emerald-900/5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-900 font-bold mb-3 flex items-center">
              <CheckSquare className="h-4 w-4 mr-1 text-emerald-700" />
              <span>Simulate Return Checkin Scan</span>
            </h3>

            <form onSubmit={handleCheckInSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-emerald-950 uppercase mb-1">
                  Scan / Input Book ID
                </label>
                <input
                  id="checkin-book-id"
                  type="text"
                  placeholder="e.g., b3, b5"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono"
                  value={ciBookId}
                  onChange={(e) => setCiBookId(e.target.value)}
                  required
                />
              </div>

              <button
                id="submit-checkin-scan"
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white rounded-lg p-2 text-xs font-bold cursor-pointer font-sans"
              >
                {submitting ? "Computing fines..." : "Process Return Scan"}
              </button>
            </form>
          </div>

          {/* Add Book Portal form */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-900 font-bold mb-3 flex items-center">
              <Plus className="h-4 w-4 mr-1 text-emerald-700" />
              <span>Catalog New Book Copy</span>
            </h3>

            <form onSubmit={handleAddBookSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-0.5 font-semibold">Title</label>
                <input
                  id="add-book-title"
                  type="text"
                  placeholder="e.g., Efuru"
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                  value={nbTitle}
                  onChange={(e) => setNbTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-0.5 font-semibold">Author</label>
                  <input
                    id="add-book-author"
                    type="text"
                    placeholder="Flora Nwapa"
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                    value={nbAuthor}
                    onChange={(e) => setNbAuthor(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-0.5 font-semibold">Genre Category</label>
                  <select
                    id="add-book-genre"
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                    value={nbGenre}
                    onChange={(e) => setNbGenre(e.target.value)}
                  >
                    <option value="African Fiction">African Fiction</option>
                    <option value="African Literature">African Literature</option>
                    <option value="Drama">Drama</option>
                    <option value="Social Sciences">Social Sciences</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-0.5 font-semibold">Storage Shelf</label>
                  <input
                    id="add-book-shelf"
                    type="text"
                    placeholder="Shelf B3"
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono"
                    value={nbShelf}
                    onChange={(e) => setNbShelf(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-0.5 font-semibold">ISBN String</label>
                  <input
                    id="add-book-isbn"
                    type="text"
                    placeholder="978-014118..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono"
                    value={nbIsbn}
                    onChange={(e) => setNbIsbn(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                id="submit-add-book"
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-100 hover:bg-amber-200 text-emerald-950 font-semibold rounded-lg p-2 text-xs tracking-wider"
              >
                Add to Index
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Overdue Books Table & Custom Popular Genre Chart */}
        <div className="lg:col-span-8 space-y-6">
          {/* Overdue Books Lists */}
          <div className="bg-slate-50/55 p-4 rounded-xl border border-slate-100">
            <h3 className="text-xs font-mono uppercase tracking-wider text-rose-700 font-bold mb-4 flex items-center">
              <ShieldAlert className="h-4 w-4 mr-1 text-rose-700" />
              <span>Overdue Circulation Warning Tracking ({overdueLoans.length})</span>
            </h3>

            {overdueLoans.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg border border-slate-100">
                <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">Zero overdue loans logged.</p>
                <p className="text-[10px] text-slate-400">All borrowers returned physical books ahead of critical timeline boundaries.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs bg-white rounded-lg shadow-xs overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left">Overdue Book Info</th>
                      <th className="px-3 py-2 text-left">Responsible Borrower</th>
                      <th className="px-3 py-2 text-left">Due Date</th>
                      <th className="px-3 py-2 text-right">SMS Warning Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overdueLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-amber-50/15">
                        <td className="px-3 py-3">
                          <div className="font-bold text-emerald-950">{loan.bookTitle}</div>
                          <div className="text-[10px] text-slate-500 font-mono">ISBN: {loan.isbn} | BookID: {loan.bookId}</div>
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          <div className="font-semibold">{loan.memberName}</div>
                          <div className="text-[10px] text-slate-500">{loan.memberEmail}</div>
                        </td>
                        <td className="px-3 py-3 font-mono text-rose-700 font-bold">
                          {loan.dueDate}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            id={`reminder-btn-loan-${loan.id}`}
                            onClick={() => executeSMSReminder(loan.id, loan.bookTitle)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-rose-100 transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="h-2.5 w-2.5" />
                            <span>Ping User</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Popular Genre Custom Chart & Analysis report */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-900 font-bold mb-4 flex items-center">
              <BarChart3 className="h-4 w-4 mr-1 text-emerald-700" />
              <span>Library Catalog Genre Popularity Distribution</span>
            </h3>

            <div className="space-y-3">
              {sortedGenresStats.map((item, index) => {
                const totalBooks = books.length;
                const percentage = totalBooks > 0 ? (item.count / totalBooks) * 100 : 0;

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-emerald-950 flex items-center">
                        <Tag className="h-3 w-3 mr-1 text-emerald-700" />
                        {item.genre}
                      </span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        <b>{item.count} items</b> ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    {/* Visual bar block */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-750 transition-all duration-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 text-[11px] leading-relaxed text-slate-500 border-t border-slate-100 pt-3">
              💡 <b>Librarian Analytics:</b> The most prominent genre categorized inside Takoradi Library catalog indexes currently is <b className="text-emerald-950 font-bold">African Fiction / African Literature</b>. This aligns with academic studies highlighting increased reader alignment with native regional publications.
            </div>
          </div>

          {/* Checkout Help Quick Reference cards list */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs">
            <h4 className="font-bold text-emerald-950 mb-2">Checkout Helper (Click to scan easily)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {books.slice(0, 4).map((b) => (
                <div
                  id={`checkout-help-card-${b.id}`}
                  key={b.id}
                  onClick={() => handleSelectCheckoutHelp(b.id)}
                  className={`p-2 rounded-lg border bg-white cursor-pointer hover:border-emerald-600 hover:bg-emerald-50/15 duration-100 ${
                    coBookId === b.id ? "bg-emerald-50 border-emerald-600" : "border-slate-100"
                  }`}
                >
                  <p className="font-bold truncate text-emerald-950 font-sans">{b.title}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-550 mt-1 font-mono">
                    <span>ID: {b.id}</span>
                    <span className={b.status === "Available" ? "text-emerald-700" : "text-amber-700"}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
