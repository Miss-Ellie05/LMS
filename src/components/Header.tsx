/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BookOpen, ShieldAlert, Award, LogOut, User } from "lucide-react";
import { Member } from "../types.ts";

interface HeaderProps {
  userSession: { role: "patron" | "librarian"; patron?: Member } | null;
  onLogout: () => void;
}

export default function Header({ userSession, onLogout }: HeaderProps) {
  return (
    <header className="bg-amber-50 border-b border-amber-100 sticky top-0 z-50 shadow-xs" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-700 text-amber-100 p-2.5 rounded-xl shadow-md flex items-center justify-center">
              <BookOpen className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-emerald-950 font-sans font-bold text-lg sm:text-xl tracking-tight">
                  Takoradi Library
                </span>
                <span className="bg-emerald-100 text-emerald-805 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  LMS v2.1
                </span>
              </div>
              <p className="text-[11px] font-mono text-emerald-700/80 uppercase tracking-widest hidden sm:block">
                Western Region Academic Resource Hub
              </p>
            </div>
          </div>

          {/* Session Info & Sign Out Button */}
          {userSession ? (
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Authenticated user pill */}
              <div className="hidden md:flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-xl border border-amber-900/10 shadow-3xs animate-fade-in">
                {userSession.role === "librarian" ? (
                  <>
                    <ShieldAlert className="h-4 w-4 text-emerald-700" />
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase block">Authority Session</span>
                      <span className="text-xs font-bold text-slate-800">Librarian Administrator</span>
                    </div>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 text-emerald-700" />
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase block">Borrower Workspace</span>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">{userSession.patron?.name}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Log Out Action */}
              <button
                id="header-logout-btn"
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100/85 text-rose-800 border border-rose-200/50 rounded-xl text-xs font-semibold tracking-wide transition duration-155 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-600" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center text-[11px] font-mono text-emerald-805 bg-emerald-950/5 px-3 py-1.5 rounded-lg border border-emerald-900/5 uppercase tracking-wider">
              <span>Secure Access Gateway</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
