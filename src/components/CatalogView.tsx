/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Compass, BookOpen, AlertCircle, Bookmark, CheckCircle, Tag, HardDrive } from "lucide-react";
import { Book, Member } from "../types.ts";

interface CatalogViewProps {
  books: Book[];
  activeMember: Member | null;
  onRefreshBooks: () => void;
  onSimulateCheckout: (bookId: string, barcode: string) => Promise<void>;
  onSimulateCheckin: (bookId: string) => Promise<void>;
}

export default function CatalogView({
  books,
  activeMember,
  onRefreshBooks,
  onSimulateCheckout,
  onSimulateCheckin,
}: CatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [checkoutBarcodes, setCheckoutBarcodes] = useState<{ [bookId: string]: string }>({});
  const [submittingIds, setSubmittingIds] = useState<{ [key: string]: boolean }>({});
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-fill active member's barcode if they are logged in or scanned
  useEffect(() => {
    if (activeMember) {
      const updatedBarcodes: { [bookId: string]: string } = {};
      books.forEach((b) => {
        if (!checkoutBarcodes[b.id]) {
          updatedBarcodes[b.id] = activeMember.barcode;
        }
      });
      if (Object.keys(updatedBarcodes).length > 0) {
        setCheckoutBarcodes((prev) => ({ ...prev, ...updatedBarcodes }));
      }
    }
  }, [activeMember, books]);

  const genres = ["All", ...Array.from(new Set(books.map((b) => b.genre)))];

  const filteredBooks = books.filter((book) => {
    const matchesQuery =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery) ||
      book.shelf.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
    const matchesStatus = selectedStatus === "All" || book.status === selectedStatus;

    return matchesQuery && matchesGenre && matchesStatus;
  });

  const handleCheckoutSubmit = async (bookId: string) => {
    const barcode = checkoutBarcodes[bookId] || (activeMember ? activeMember.barcode : "");
    if (!barcode.trim()) {
      setLocalError("Please select a member profile or input a valid library card barcode (e.g., TAK-58291)");
      setTimeout(() => setLocalError(null), 5000);
      return;
    }

    setSubmittingIds((prev) => ({ ...prev, [bookId]: true }));
    setLocalError(null);
    try {
      await onSimulateCheckout(bookId, barcode.trim());
      setSuccessMsg(`Successfully checked out! Book barcode matches ${barcode}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setLocalError(err.message || "Checkout failed due to membership blocks or status.");
      setTimeout(() => setLocalError(null), 6005);
    } finally {
      setSubmittingIds((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  const handleReturnSubmit = async (bookId: string) => {
    setSubmittingIds((prev) => ({ ...prev, [bookId]: true }));
    setLocalError(null);
    try {
      await onSimulateCheckin(bookId);
      setSuccessMsg("Check-in registration completed. Overdue fines computed if applicable.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setLocalError(err.message || "Failed to process check-in return.");
      setTimeout(() => setLocalError(null), 5000);
    } finally {
      setSubmittingIds((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-900/10 p-6 shadow-xs" id="catalog-section">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-amber-500/10">
        <div>
          <h2 className="text-xl font-bold text-emerald-950 font-sans tracking-tight">
            Unified Book Catalog
          </h2>
          <p className="text-xs text-emerald-800 font-medium">
            Fuzzy index search of physical/digital assets with shelf relocation and availability status.
          </p>
        </div>
        <div className="text-xs bg-amber-50 border border-amber-100 text-amber-900 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 mt-2 sm:mt-0">
          <HardDrive className="inline h-3.5 w-3.5 text-amber-600" />
          <span>Active Book Count: <b>{books.length} items</b></span>
        </div>
      </div>

      {/* Notifications Panel */}
      {localError && (
        <div className="mb-4 bg-rose-50 border-l-4 border-rose-600 text-rose-900 p-4 rounded-r-lg text-xs" role="alert">
          <div className="flex">
            <AlertCircle className="h-4 w-4 mr-2 shrink-0 text-rose-600" />
            <div>
              <span className="font-bold">Transaction Blocked:</span> {localError}
            </div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-900 p-4 rounded-r-lg text-xs" role="alert">
          <div className="flex">
            <CheckCircle className="h-4 w-4 mr-2 shrink-0 text-emerald-600" />
            <div>
              <span className="font-bold">Database Synchronized:</span> {successMsg}
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
        <div className="relative md:col-span-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-emerald-700/60" />
          </span>
          <input
            id="book-search-input"
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-emerald-950 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:bg-white"
            placeholder="Search by Title, Author, Shelf ID, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="md:col-span-3">
          <select
            id="genre-filter-select"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-emerald-950 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="All">All Genres</option>
            {genres.filter(g => g !== "All").map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            id="status-filter-select"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-emerald-950 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Borrowed">Borrowed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-amber-50/20 rounded-xl border border-dashed border-amber-900/10">
          <Compass className="mx-auto h-8 w-8 text-amber-800/50 mb-3 animate-pulse" />
          <h3 className="font-semibold text-emerald-950 text-sm">No books match criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the keyword filter or choosing another shelf.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredBooks.map((book) => {
            const isAvailable = book.status === "Available";
            const isBorrowed = book.status === "Borrowed";
            const isOverdue = book.status === "Overdue";

            return (
              <div
                key={book.id}
                id={`book-card-${book.id}`}
                className={`p-4 rounded-xl border transition-all ${
                  isOverdue
                    ? "bg-rose-50/35 border-rose-200 hover:border-rose-300"
                    : isBorrowed
                    ? "bg-amber-50/30 border-amber-200 hover:border-amber-300"
                    : "bg-emerald-50/10 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 shadow-xs"
                }`}
              >
                <div className="flex gap-4">
                  {/* Book Spine Icon Box */}
                  <div
                    className={`h-16 w-12 rounded-lg py-2 px-1 text-center shrink-0 shadow-xs flex flex-col justify-between ${
                      isOverdue
                        ? "bg-rose-700 text-rose-50"
                        : isBorrowed
                        ? "bg-amber-700 text-amber-50"
                        : "bg-emerald-800 text-emerald-50"
                    }`}
                  >
                    <span className="text-[9px] font-mono leading-none tracking-widest break-all">
                      {book.id.toUpperCase()}
                    </span>
                    <BookOpen className="h-4 w-4 mx-auto" />
                    <span className="text-[7px] font-mono leading-none">{book.shelf}</span>
                  </div>

                  {/* Main Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm text-emerald-950 truncate max-w-[80%]">
                        {book.title}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold leading-4 shrink-0 font-mono ${
                          isAvailable
                            ? "bg-emerald-100 text-emerald-800"
                            : isOverdue
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {book.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate">by {book.author}</p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-mono text-slate-500">
                      <span className="flex items-center">
                        <Tag className="h-3 w-3 mr-1 text-emerald-700" />
                        {book.genre}
                      </span>
                      <span>•</span>
                      <span>ISBN: {book.isbn}</span>
                      <span>•</span>
                      <span className="bg-amber-100/60 px-1.5 py-0.2 rounded text-emerald-950 font-bold">
                        {book.shelf}
                      </span>
                    </div>

                    {/* Patron Quick Reserve Simulation Tool */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100">
                      {isAvailable ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Scan Library Barcode..."
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono placeholder-slate-400 focus:outline-hidden focus:border-emerald-700 grow"
                            value={checkoutBarcodes[book.id] || ""}
                            onChange={(e) =>
                              setCheckoutBarcodes({
                                ...checkoutBarcodes,
                                [book.id]: e.target.value.toUpperCase(),
                              })
                            }
                          />
                          <button
                            id={`checkout-btn-${book.id}`}
                            onClick={() => handleCheckoutSubmit(book.id)}
                            disabled={submittingIds[book.id]}
                            className="bg-emerald-700 hover:bg-emerald-800 text-amber-50 rounded-lg px-3 py-1 text-xs font-semibold tracking-wide cursor-pointer text-center duration-150 shrink-0 disabled:opacity-50"
                          >
                            {submittingIds[book.id] ? "Processing..." : "Check Out"}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-slate-50 px-3 py-2 rounded-lg text-xs space-y-1.5">
                          <p className="text-slate-600">
                            Borrowed by <b className="text-emerald-950">{book.borrowerName || "Unknown Member"}</b> 
                            {book.dueDate && (
                              <span> (Due <b className="text-amber-800">{book.dueDate}</b>)</span>
                            )}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
                              {isOverdue ? "⚠️ Overdue Notice Sent" : "✓ On Timeline Ledger"}
                            </span>
                            <button
                              id={`return-btn-${book.id}`}
                              onClick={() => handleReturnSubmit(book.id)}
                              disabled={submittingIds[book.id]}
                              className="text-emerald-800 hover:text-emerald-900 hover:underline font-bold text-[11px]"
                            >
                              {submittingIds[book.id] ? "Returning..." : "Scan Return ✔"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
