/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserPlus, Award, Phone, Calendar, Mail, CheckCircle, Smartphone, Landmark, RotateCw, AlertTriangle } from "lucide-react";
import { Member, SMSAlert } from "../types.ts";

interface MembershipViewProps {
  members: Member[];
  smsAlerts: SMSAlert[];
  activeMember: Member | null;
  onSelectMember: (member: Member | null) => void;
  onRegisterMember: (member: { name: string; email: string; accountType: "Student" | "Researcher" | "Community Member" }) => Promise<void>;
  onClearFines: (id: string) => Promise<void>;
}

export default function MembershipView({
  members,
  smsAlerts,
  activeMember,
  onSelectMember,
  onRegisterMember,
  onClearFines,
}: MembershipViewProps) {
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newType, setNewType] = useState<"Student" | "Researcher" | "Community Member">("Student");
  const [success, setSuccess] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      setErr("Please fulfill member name and email descriptors.");
      return;
    }

    setSubmitting(true);
    setErr(null);
    setSuccess(null);

    try {
      await onRegisterMember({
        name: newName,
        email: newEmail,
        accountType: newType,
      });
      setSuccess(`Congratulations! ${newName} successfully indexed with custom TAK barcode.`);
      setNewName("");
      setNewEmail("");
      setTimeout(() => setSuccess(null), 5000);
    } catch (error: any) {
      setErr(error.message || "Email might already be indexed.");
    } finally {
      setSubmitting(false);
    }
  };

  const clearFinesHandler = async (id: string, name: string) => {
    if (confirm(`Settle all logged fines (GH₵) for ${name}?`)) {
      try {
        await onClearFines(id);
        setSuccess(`Fines successfully settled for ${name}. Account status is safe.`);
        setTimeout(() => setSuccess(null), 4000);
      } catch (e: any) {
        setErr("Could not clear fines.");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-900/10 p-6 shadow-xs" id="membership-section">
      {/* Module Title */}
      <div className="pb-6 mb-6 border-b border-amber-500/10">
        <h2 className="text-xl font-bold text-emerald-950 font-sans tracking-tight">
          Membership Ledger & Electronic Cards
        </h2>
        <p className="text-xs text-emerald-800 font-medium font-sans">
          Register new patrons, track accumulated overdue fine lists, and preview automated SMS transaction reminders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Registration Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Create Member Form */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold mb-4 flex items-center">
              <UserPlus className="h-4 w-4 mr-1 text-emerald-700" />
              <span>Enroll New Member</span>
            </h3>

            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs rounded-lg mb-4">
                {success}
              </div>
            )}

            {err && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-900 text-xs rounded-lg mb-4">
                {err}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  Patron Name
                </label>
                <input
                  id="member-enroll-name"
                  type="text"
                  placeholder="e.g., Ekow Mensah"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  Email Address
                </label>
                <input
                  id="member-enroll-email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  Patron Type Filter
                </label>
                <select
                  id="member-enroll-type"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-emerald-950"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                >
                  <option value="Student">Student</option>
                  <option value="Researcher">Researcher</option>
                  <option value="Community Member">Community Member</option>
                </select>
              </div>

              <button
                id="submit-enroll-btn"
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-amber-50 rounded-lg p-2.5 text-xs font-bold tracking-wide cursor-pointer text-center duration-150"
              >
                {submitting ? "Processing..." : "Register Card Barcode"}
              </button>
            </form>
          </div>

          {/* Interactive Library Card Mockup Preview component */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold mb-3">
              Digital Membership Card Preview
            </h3>

            {activeMember ? (
              <div
                id="digital-id-card"
                className="bg-radial from-emerald-800 to-emerald-950 text-amber-50 p-6 rounded-2xl shadow-md border border-emerald-700/60 font-sans relative overflow-hidden"
              >
                {/* Background watermarks */}
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-200/5 -mr-10 -mt-10 pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="bg-amber-100/10 text-amber-300 text-[9px] uppercase tracking-widest font-mono font-bold px-2 py-0.5 rounded-full">
                      Takoradi Library ID
                    </span>
                    <h4 className="font-bold text-base mt-1.5 text-white leading-tight">
                      {activeMember.name}
                    </h4>
                    <p className="text-[11px] text-amber-100/70">{activeMember.email}</p>
                  </div>
                  <Award className="h-8 w-8 text-amber-300 shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-4 pb-5 border-b border-white/10 text-[11px] font-mono">
                  <div>
                    <span className="text-[9px] block text-emerald-300/80 tracking-wide uppercase">
                      Account Type
                    </span>
                    <span className="font-semibold text-white">{activeMember.accountType}</span>
                  </div>
                  <div>
                    <span className="text-[9px] block text-emerald-300/80 tracking-wide uppercase">
                      Issue Date
                    </span>
                    <span className="font-semibold text-white">{activeMember.joinedAt}</span>
                  </div>
                </div>

                {/* Styled CSS Barcode Component */}
                <div className="pt-4 flex flex-col items-center justify-center bg-white/95 rounded-xl text-emerald-950 p-3 mt-1 shadow-sm">
                  {/* Dynamic stripe array simulation */}
                  <div className="flex items-stretch justify-center h-10 w-full mb-1 bg-white px-2">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 3, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3].map((width, idx) => (
                      <span
                        key={idx}
                        className="bg-black inline-block rounded-xs"
                        style={{
                          width: `${width * 2}px`,
                          marginRight: idx % 2 === 0 ? "2px" : "3px",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold tracking-widest">{activeMember.barcode}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 border-dashed rounded-2xl p-8 text-center text-slate-500">
                <Smartphone className="h-10 w-10 text-slate-300 mx-auto mb-2.5" />
                <p className="text-xs font-semibold text-slate-600">No active card preview</p>
                <p className="text-[10px] text-slate-500 mt-1">Select a member from the ledger to load their digital barcode.</p>
              </div>
            )}
          </div>
        </div>

        {/* Members List Table Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-50/55 p-4 rounded-xl border border-slate-100">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold mb-4">
              Registered Library Patrons ({members.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs bg-white rounded-lg shadow-xs overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Member Info</th>
                    <th className="px-3 py-2 text-left">Barcode ID</th>
                    <th className="px-3 py-2 text-right">Fines Owed</th>
                    <th className="px-3 py-2 text-right">Card Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 divide-solid">
                  {members.map((m) => {
                    const hasFines = m.fines > 0;
                    const isActive = activeMember?.id === m.id;

                    return (
                      <tr
                        key={m.id}
                        id={`member-row-${m.id}`}
                        className={`hover:bg-amber-50/10 cursor-pointer transition ${
                          isActive ? "bg-amber-50/25" : ""
                        }`}
                        onClick={() => onSelectMember(m)}
                      >
                        <td className="px-3 py-3">
                          <div className="font-bold text-emerald-950 flex items-center">
                            {m.name}
                            <span className="ml-1.5 text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.1 rounded">
                              {m.accountType[0]}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">{m.email}</div>
                        </td>
                        <td className="px-3 py-3 font-mono font-semibold text-slate-700 tracking-tight">
                          {m.barcode}
                        </td>
                        <td className="px-3 py-3 text-right">
                          {hasFines ? (
                            <div className="inline-flex flex-col items-end">
                              <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] flex items-center">
                                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                                ¢{m.fines.toFixed(2)}
                              </span>
                              <button
                                id={`settle-fine-btn-${m.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearFinesHandler(m.id, m.name);
                                }}
                                className="text-[9px] text-emerald-800 hover:text-emerald-950 font-semibold hover:underline mt-0.5 cursor-pointer"
                              >
                                Clear Fee
                              </button>
                            </div>
                          ) : (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                              Safe ¢0
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            id={`load-preview-btn-${m.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectMember(m);
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                              isActive
                                ? "bg-emerald-850 text-white border-emerald-850"
                                : "bg-white text-emerald-950 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            Preview Card
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SMS Notification Outbox Logger */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs">
            <h4 className="text-yellow-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-800 pb-2 mb-3 flex items-center">
              <Smartphone className="h-4 w-4 mr-1 text-yellow-400" />
              <span>Automated SMS Dispatch System Logs ({smsAlerts.length})</span>
            </h4>

            {smsAlerts.length === 0 ? (
              <p className="text-slate-500 italic text-[11px] py-2">No notifications have been triggered during this session yet.</p>
            ) : (
              <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                {smsAlerts.slice().reverse().map((alert) => (
                  <div key={alert.id} className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-900 mb-1.5">
                      <span className="font-bold text-slate-400 text-[10px]">{alert.recipientPhoneFormatted}</span>
                      <span className="text-[9px] font-semibold text-sky-400 bg-sky-950 px-1 rounded uppercase">
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed italic">"{alert.message}"</p>
                    <div className="flex justify-between items-center mt-1 text-[9px] text-slate-500">
                      <span>Sent: {alert.sentAt}</span>
                      <span className="text-emerald-400 font-bold font-sans">● DELIVERED</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
