/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BookOpen, ShieldAlert, Award, ArrowRight, Lock, Mail, ChevronRight, Sparkles, AlertCircle } from "lucide-react";
import { Member } from "../types.ts";

interface LoginViewProps {
  members: Member[];
  onLoginPatron: (member: Member) => void;
  onLoginLibrarian: () => void;
}

export default function LoginView({ members, onLoginPatron, onLoginLibrarian }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<"patron" | "librarian">("patron");
  
  // Patron input state
  const [patronInput, setPatronInput] = useState("");
  const [patronError, setPatronError] = useState<string | null>(null);

  // Librarian input state
  const [libEmail, setLibEmail] = useState("librarian@takoradilib.gov.gh");
  const [libPassword, setLibPassword] = useState("admin");
  const [libError, setLibError] = useState<string | null>(null);

  const handlePatronLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPatronError(null);

    const inputCleaned = patronInput.trim().toLowerCase();
    if (!inputCleaned) {
      setPatronError("Please enters a valid Email or Barcode ID");
      return;
    }

    // Search members
    const matched = members.find(
      m => m.email.toLowerCase() === inputCleaned || m.barcode.toLowerCase() === inputCleaned
    );

    if (matched) {
      onLoginPatron(matched);
    } else {
      setPatronError(
        "Barcode / Email is not associated with any active member. Try 'TKD-9811' or select from the quick-login members list below."
      );
    }
  };

  const handleLibrarianLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLibError(null);

    if (libEmail.trim() === "librarian@takoradilib.gov.gh" && libPassword === "admin") {
      onLoginLibrarian();
    } else {
      setLibError("Invalid administrator credentials. Hint: Use librarian@takoradilib.gov.gh / admin");
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-[80vh] bg-slate-50" id="login-portal">
      {/* Decorative Information Panel */}
      <div className="lg:w-1/2 bg-emerald-950 text-amber-50 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden" id="login-info-panel border-r border-emerald-900">
        {/* Subtle abstract background grids */}
        <div className="absolute inset-0 bg-radial from-emerald-800 via-transparent to-transparent opacity-40" />
        <div className="absolute -right-16 -bottom-16 w-64 h-64 border-4 border-amber-400/10 rounded-full pointer-events-none" />
        <div className="absolute top-12 left-12 w-32 h-32 border border-white/5 rounded-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-amber-400 text-emerald-950 p-2.5 rounded-xl shadow-md flex items-center justify-center">
              <BookOpen className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <span className="text-white font-sans font-black text-xl tracking-tight block">Takoradi Library</span>
              <span className="text-amber-300 font-mono text-[9px] tracking-widest uppercase font-bold">Western Region West Africa</span>
            </div>
          </div>

          <div className="space-y-6 max-w-md">
            <span className="bg-emerald-900/60 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-widest inline-block border border-emerald-800">
              Integrated Resource LMS
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Unlock local wisdom & global research reserves.
            </h1>
            <p className="text-amber-100/75 text-xs sm:text-sm leading-relaxed">
              Serving Students, Researchers, and Takoradi Community Members with seamless book ledger transparency, real-time computerized study carrels, and text alert scheduling.
            </p>
          </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/10 mt-12 lg:mt-0">
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-amber-300/60 block uppercase">Catalog Units</span>
              <span className="text-base font-bold text-white">2,500+ Volumes</span>
            </div>
            <div>
              <span className="text-[10px] text-amber-300/60 block uppercase">Global Connectivity</span>
              <span className="text-base font-bold text-white">Fiber Lab Access</span>
            </div>
          </div>
          <p className="text-[10px] text-emerald-300/50 mt-4 leading-relaxed font-mono">
            Developed in safe compatibility with Ghana digital school clusters initiatives. Port 3000 Active Sandbox Node.
          </p>
        </div>
      </div>

      {/* Interactive Form Panel */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-20 flex items-center justify-center" id="login-form-panel">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-emerald-950 font-sans tracking-tight">
              LMS Portal Sign In
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              Select your pathway tab below to access your custom LMS workspace.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="bg-emerald-950/5 p-1 rounded-xl flex items-center" id="role-selector-tabs">
            <button
              id="login-tab-patron"
              onClick={() => setActiveTab("patron")}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === "patron"
                  ? "bg-emerald-700 text-white shadow-md hover:bg-emerald-700"
                  : "text-emerald-900 hover:bg-emerald-900/10"
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Borrower / Patron</span>
            </button>
            <button
              id="login-tab-librarian"
              onClick={() => setActiveTab("librarian")}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === "librarian"
                  ? "bg-emerald-700 text-white shadow-md hover:bg-emerald-700"
                  : "text-emerald-900 hover:bg-emerald-900/10"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Librarian Desk</span>
            </button>
          </div>

          {/* Form Area */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs" id="auth-card">
            {activeTab === "patron" ? (
              // Borrower View Form
              <form onSubmit={handlePatronLoginSubmit} className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-[11px] uppercase tracking-wider mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Enter Card ID / Email Address</span>
                </div>

                {patronError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-900 text-[11px] rounded-lg flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{patronError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">
                    Email or Barcode (e.g. TKD-9811)
                  </label>
                  <div className="relative">
                    <input
                      id="patron-auth-input"
                      type="text"
                      className="w-full bg-slate-55 border border-slate-200 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 rounded-xl p-3 pl-10 text-xs text-slate-900 outline-hidden transition duration-150"
                      placeholder="e.g., abena.mensah@university.edu.gh or TKD-9811"
                      value={patronInput}
                      onChange={(e) => {
                        setPatronInput(e.target.value);
                        setPatronError(null);
                      }}
                      required
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <button
                  id="patron-login-btn"
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-amber-50 rounded-xl p-3 text-xs font-bold tracking-wide transition duration-150 cursor-pointer flex items-center justify-center space-x-1"
                >
                  <span>Access Patron Dashboard</span>
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Quick select logins */}
                <div id="quick-login-selection" className="pt-4 border-t border-slate-100 mt-4">
                  <span className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-2 font-semibold">
                    Simulated Active Patrons (Click to Login)
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        id={`quick-login-${m.barcode}`}
                        onClick={() => onLoginPatron(m)}
                        className="w-full text-left bg-slate-50 hover:bg-emerald-50/50 p-2 rounded-lg border border-slate-200/50 flex justify-between items-center group transition duration-100 cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-xs text-slate-800 block group-hover:text-emerald-950">
                            {m.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {m.accountType} • {m.email}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-650 px-1.5 py-0.5 rounded shrink-0 group-hover:border-emerald-200 group-hover:text-emerald-800">
                          {m.barcode}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              // Librarian View Form
              <form onSubmit={handleLibrarianLoginSubmit} className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-[11px] uppercase tracking-wider mb-2">
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                  <span>Librarian Credentials Login</span>
                </div>

                {libError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-900 text-[11px] rounded-lg">
                    {libError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">
                    Admin Email
                  </label>
                  <div className="relative">
                    <input
                      id="lib-auth-email"
                      type="email"
                      className="w-full bg-slate-55 border border-slate-200 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 rounded-xl p-3 pl-10 text-xs text-slate-900 outline-hidden transition duration-150"
                      value={libEmail}
                      onChange={(e) => {
                        setLibEmail(e.target.value);
                        setLibError(null);
                      }}
                      required
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="lib-auth-password"
                      type="password"
                      className="w-full bg-slate-55 border border-slate-200 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 rounded-xl p-3 pl-10 text-xs text-slate-900 outline-hidden transition duration-150"
                      value={libPassword}
                      onChange={(e) => {
                        setLibPassword(e.target.value);
                        setLibError(null);
                      }}
                      required
                    />
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-[10px] text-amber-900 leading-relaxed font-mono">
                  <span className="font-bold uppercase tracking-wider block mb-0.5">Demo Auth Bypass:</span>
                  <span>Use default credentials shown above. Type freely and click Sign In to access control logs.</span>
                </div>

                <button
                  id="lib-login-btn"
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-amber-50 rounded-xl p-3 text-xs font-bold tracking-wide transition duration-150 cursor-pointer flex items-center justify-center space-x-1"
                >
                  <span>Authenticate Librarian</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
