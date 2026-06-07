/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Header from "./components/Header.tsx";
import CatalogView from "./components/CatalogView.tsx";
import SpaceBookingView from "./components/SpaceBookingView.tsx";
import MembershipView from "./components/MembershipView.tsx";
import EResourceView from "./components/EResourceView.tsx";
import LibrarianView from "./components/LibrarianView.tsx";
import LoginView from "./components/LoginView.tsx";
import { Book, SpaceBooking, Member, Loan, EResource, SMSAlert } from "./types.ts";
import { 
  Award, 
  BookOpen, 
  MapPin, 
  Smartphone, 
  CornerDownRight, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle,
  FileText
} from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<"patron" | "librarian">("patron");
  const [patronSubTab, setPatronSubTab] = useState<"books" | "spaces" | "members" | "eresources">("books");

  // User auth session
  const [userSession, setUserSession] = useState<{ role: "patron" | "librarian"; patron?: Member } | null>(null);

  // Core synchronized server-side state
  const [books, setBooks] = useState<Book[]>([]);
  const [bookings, setBookings] = useState<SpaceBooking[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [eresources, setEresources] = useState<EResource[]>([]);
  const [smsAlerts, setSmsAlerts] = useState<SMSAlert[]>([]);
  const [activeMember, setActiveMember] = useState<Member | null>(null);

  // Status visualizers
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronous server poll
  const syncServerData = async () => {
    try {
      const [resBooks, resBookings, resMembers, resEresources, resSms] = await Promise.all([
        fetch("/api/books"),
        fetch("/api/bookings"),
        fetch("/api/members"),
        fetch("/api/eresources"),
        fetch("/api/sms-alerts"),
      ]);

      if (!resBooks.ok || !resBookings.ok || !resMembers.ok || !resEresources.ok || !resSms.ok) {
        throw new Error("Failure communication loop on Node Express server.");
      }

      const booksData = await resBooks.json();
      const bookingsData = await resBookings.json();
      const membersData = await resMembers.json();
      const eresData = await resEresources.json();
      const smsData = await resSms.json();

      setBooks(booksData);
      setBookings(bookingsData);
      setMembers(membersData);
      setEresources(eresData);
      setSmsAlerts(smsData);

      // Re-map active logged in member if exists
      // We also update userSession with the fresh data from server (to capture fine changes, etc.)
      setUserSession((prev) => {
        if (prev && prev.role === "patron" && prev.patron) {
          const found = membersData.find((m: Member) => m.id === prev.patron?.id);
          if (found) {
            setActiveMember(found);
            return { role: "patron", patron: found };
          }
        }
        return prev;
      });

      if (activeMember) {
        const found = membersData.find((m: Member) => m.id === activeMember.id);
        if (found) {
          setActiveMember(found);
        }
      }

      // Reconstruct simple pseudo préstamos timeline listings based on book loan pointers for safety:
      const loansCollected: Loan[] = [];
      booksData.forEach((b: Book) => {
        if (b.status !== "Available") {
          loansCollected.push({
            id: "ln_b_" + b.id,
            bookId: b.id,
            bookTitle: b.title,
            author: b.author,
            isbn: b.isbn,
            memberEmail: b.borrowerId ? (membersData.find((m: Member) => m.id === b.borrowerId)?.email || "active@gmail.com") : "active@gmail.com",
            memberName: b.borrowerName || "Active Student Slot",
            borrowDate: b.status === "Overdue" ? "2026-05-20" : "2026-06-01",
            dueDate: b.dueDate || "2026-06-15",
            status: b.status === "Overdue" ? "Overdue" : "Active"
          });
        }
      });
      setLoans(loansCollected);

      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to synchronize REST resources from Express endpoint.");
      setLoading(false);
    }
  };

  useEffect(() => {
    syncServerData();
  }, []);

  // 1. Checkout Transaction
  const handleCheckoutSim = async (bookId: string, barcode: string) => {
    const rawRes = await fetch("/api/loans/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, memberBarcode: barcode }),
    });

    if (!rawRes.ok) {
      const errPayload = await rawRes.json();
      throw new Error(errPayload.error || "Failed checkout action.");
    }

    await syncServerData();
  };

  // 2. Checkin / Return Transaction
  const handleCheckinSim = async (bookId: string) => {
    const rawRes = await fetch("/api/loans/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });

    if (!rawRes.ok) {
      const errPayload = await rawRes.json();
      throw new Error(errPayload.error || "Failed checkin action.");
    }
    const data = await rawRes.json();
    await syncServerData();
    return data;
  };

  // 3. New Booking Reservation
  const handleAddBookingSim = async (newB: Omit<SpaceBooking, "id">) => {
    const rawRes = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newB),
    });

    if (!rawRes.ok) {
      const errPayload = await rawRes.json();
      throw new Error(errPayload.error || "Seating collision / rule block.");
    }

    await syncServerData();
  };

  // 4. Cancel Booking Reservation
  const handleCancelBookingSim = async (id: string) => {
    const rawRes = await fetch(`/api/bookings/${id}`, {
      method: "DELETE",
    });

    if (!rawRes.ok) {
      throw new Error("Failed to cancel booking session.");
    }

    await syncServerData();
  };

  // 5. Enroll Membership
  const handleRegisterMemberSim = async (newM: { name: string; email: string; accountType: "Student" | "Researcher" | "Community Member" }) => {
    const rawRes = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newM),
    });

    if (!rawRes.ok) {
      const errPayload = await rawRes.json();
      throw new Error(errPayload.error || "Email already indexed.");
    }

    const createdMember = await rawRes.json();
    setActiveMember(createdMember);
    await syncServerData();
  };

  // 6. Clear Academic fine fees
  const handleClearFinesSim = async (id: string) => {
    const rawRes = await fetch(`/api/members/${id}/settle-fines`, {
      method: "POST",
    });

    if (!rawRes.ok) {
      throw new Error("Could not settle outstanding fines.");
    }

    await syncServerData();
  };

  // 7. Increment E-Resource downloads stats counters
  const handleResourceDownloadSim = async (id: string) => {
    const rawRes = await fetch(`/api/eresources/download/${id}`, {
      method: "POST",
    });

    if (rawRes.ok) {
      await syncServerData();
    }
  };

  // 8. Dispatch Custom SMS Alarm alerts from the backend
  const handleSendSMSReminderSim = async (loanId: string) => {
    const rawRes = await fetch("/api/sms-alerts/send-reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loanId }),
    });

    if (!rawRes.ok) {
      throw new Error("Overdue warning dispatch error.");
    }

    await syncServerData();
  };

  // Direct Book Add
  const handleAddBookCatalogSim = async (book: { title: string; author: string; genre: string; shelf: string; isbn: string }) => {
    const rawRes = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });

    if (!rawRes.ok) {
      throw new Error("Failed to index book.");
    }

    await syncServerData();
  };

  // Auth Action Handlers
  const handleLoginPatron = (member: Member) => {
    setUserSession({ role: "patron", patron: member });
    setActiveMember(member);
    setCurrentTab("patron");
  };

  const handleLoginLibrarian = () => {
    setUserSession({ role: "librarian" });
    setActiveMember(null);
    setCurrentTab("librarian");
  };

  const handleLogout = () => {
    setUserSession(null);
    setActiveMember(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="lms-app-root">
      {/* Dynamic Header */}
      <Header userSession={userSession} onLogout={handleLogout} />

      {loading ? (
        <div className="flex-1 flex items-center justify-center p-12 bg-white" id="loading-fallback">
          <div className="text-center space-y-3.5">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-700 mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Initializing Takoradi Database & Syncing API...</p>
          </div>
        </div>
      ) : errorMsg ? (
        <div className="flex-1 max-w-3xl mx-auto px-4 py-12" id="error-fallback">
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-6 rounded-2xl text-center space-y-3 shadow-xs">
            <ShieldAlert className="h-10 w-10 text-rose-600 mx-auto" />
            <h3 className="font-bold text-sm">REST Connection Failures</h3>
            <p className="text-xs text-rose-800">{errorMsg}</p>
            <button
              id="retry-connection-btn"
              onClick={syncServerData}
              className="bg-rose-700 hover:bg-rose-800 text-white rounded-lg px-4 py-1.5 text-xs font-bold"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : !userSession ? (
        <LoginView
          members={members}
          onLoginPatron={handleLoginPatron}
          onLoginLibrarian={handleLoginLibrarian}
        />
      ) : (
        <>
          {/* Hero Quick Statistics banner */}
          <div className="bg-emerald-950 text-amber-50 py-10 px-4 sm:px-6 lg:px-8 shadow-inner relative overflow-hidden" id="hero-banner">
            {/* Abstract decorative graphic vectors representing literary architecture */}
            <div className="absolute inset-0 bg-radial from-emerald-800 via-transparent to-transparent opacity-35" />
            <div className="absolute right-12 bottom-0 w-32 h-32 border-4 border-amber-400/15 rounded-full -mr-10 -mb-10 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between relative z-10 gap-6">
              <div>
                <div className="flex items-center space-x-2 text-amber-300 text-xs font-mono tracking-widest uppercase font-bold mb-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>Takoradi Library Hub, Ghana 西部州</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
                  Integrated Resource Library System
                </h1>
                <p className="text-amber-100/85 mt-1.5 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Serving our academic, research, and general youth populations to improve digital literacy, book borrowing transparency, and computer carrel spaces fair booking.
                </p>
              </div>

              {/* Quick Active Membership barcode card component */}
              {activeMember && (
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-xs min-w-44 text-amber-50 shadow-xs flex items-center space-x-3 shrink-0">
                  <div className="h-9 w-9 bg-amber-400 text-emerald-950 rounded-xl flex items-center justify-center shrink-0">
                    <Smartphone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-300/80 uppercase font-mono tracking-wider block">Logged Active Member</span>
                    <span className="font-bold block tracking-tight truncate max-w-[124px]">{activeMember.name}</span>
                    <span className="font-mono text-[9px] block whitespace-nowrap bg-emerald-900/40 text-emerald-300 px-1.5 py-0.2 rounded mt-0.5">
                      ID: {activeMember.barcode}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full" id="lms-main-grid">
            {currentTab === "patron" ? (
              <div className="space-y-6">
                {/* Patron Nav Section */}
                <div className="flex flex-wrap items-center gap-1 bg-amber-50/15 p-1.5 rounded-xl border border-amber-900/5 shadow-xs" id="patron-tabs-bar">
                  <button
                    id="sub-tab-books"
                    onClick={() => setPatronSubTab("books")}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs leading-none font-bold tracking-wide transition duration-155 cursor-pointer ${
                      patronSubTab === "books"
                        ? "bg-white text-emerald-950 shadow-xs border border-amber-900/5 font-bold"
                        : "text-emerald-900 hover:bg-white/50"
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Books Catalog</span>
                  </button>

                  <button
                    id="sub-tab-spaces"
                    onClick={() => setPatronSubTab("spaces")}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs leading-none font-bold tracking-wide transition duration-155 cursor-pointer ${
                      patronSubTab === "spaces"
                        ? "bg-white text-emerald-950 shadow-xs border border-amber-900/5 font-bold"
                        : "text-emerald-900 hover:bg-white/50"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5 text-amber-600" />
                    <span>Tech & Study Booking</span>
                  </button>

                  <button
                    id="sub-tab-members"
                    onClick={() => setPatronSubTab("members")}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs leading-none font-bold tracking-wide transition duration-155 cursor-pointer ${
                      patronSubTab === "members"
                        ? "bg-white text-emerald-950 shadow-xs border border-amber-900/5 font-bold"
                        : "text-emerald-900 hover:bg-white/50"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Digital Member ID & SMS Alerts</span>
                  </button>

                  <button
                    id="sub-tab-eresources"
                    onClick={() => setPatronSubTab("eresources")}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs leading-none font-bold tracking-wide transition duration-155 cursor-pointer ${
                      patronSubTab === "eresources"
                        ? "bg-white text-emerald-950 shadow-xs border border-amber-900/5 font-bold"
                        : "text-emerald-900 hover:bg-white/50"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5 text-purple-600" />
                    <span>E-Resource Repository</span>
                  </button>
                </div>

                {/* Dynamic Sub Tab Views */}
                {patronSubTab === "books" && (
                  <CatalogView
                    books={books}
                    activeMember={activeMember}
                    onRefreshBooks={syncServerData}
                    onSimulateCheckout={handleCheckoutSim}
                    onSimulateCheckin={handleCheckinSim}
                  />
                )}

                {patronSubTab === "spaces" && (
                  <SpaceBookingView
                    bookings={bookings}
                    activeMember={activeMember}
                    onAddBooking={handleAddBookingSim}
                    onCancelBooking={handleCancelBookingSim}
                  />
                )}

                {patronSubTab === "members" && (
                  <MembershipView
                    members={members}
                    smsAlerts={smsAlerts}
                    activeMember={activeMember}
                    onSelectMember={setActiveMember}
                    onRegisterMember={handleRegisterMemberSim}
                    onClearFines={handleClearFinesSim}
                  />
                )}

                {patronSubTab === "eresources" && (
                  <EResourceView
                    eresources={eresources}
                    onTriggerDownload={handleResourceDownloadSim}
                  />
                )}
              </div>
            ) : (
              <LibrarianView
                books={books}
                loans={loans}
                members={members}
                onRefreshAll={syncServerData}
                onCheckInBook={handleCheckinSim}
                onCheckOutBook={handleCheckoutSim}
                onSendSMSReminder={handleSendSMSReminderSim}
                onAddBook={handleAddBookCatalogSim}
              />
            )}
          </main>
        </>
      )}

      {/* Footer copyright */}
      <footer className="bg-emerald-950 text-emerald-100/60 text-xs py-8 border-t border-emerald-900 mt-12" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-sans font-bold text-amber-200">Takoradi Library (T-LMS)</span>
            <p className="text-[11px] mt-0.5">Designed specifically for local high school, university learners, and community researchers.</p>
          </div>
          <div className="text-[11px] font-mono text-emerald-200/40">
            © 2026 Academic West Africa Projects. Port 3000 Secured Sandbox Environment.
          </div>
        </div>
      </footer>
    </div>
  );
}
