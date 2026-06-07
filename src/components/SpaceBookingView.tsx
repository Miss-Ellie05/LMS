/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Calendar, Layers, Clock, Laptop, ShieldAlert, Monitor, User, Mail, Trash2, CheckCircle2 } from "lucide-react";
import { Book, SpaceBooking, Member, Loan, EResource, SMSAlert } from "../types.ts";

interface SpaceBookingViewProps {
  bookings: SpaceBooking[];
  activeMember: Member | null;
  onAddBooking: (booking: Omit<SpaceBooking, "id">) => Promise<void>;
  onCancelBooking: (id: string) => Promise<void>;
}

export default function SpaceBookingView({
  bookings,
  activeMember,
  onAddBooking,
  onCancelBooking,
}: SpaceBookingViewProps) {
  const [spaceType, setSpaceType] = useState<"Study Carrel" | "Computer Lab">("Study Carrel");
  const [selectedSpace, setSelectedSpace] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0]);
  const [bookedByName, setBookedByName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync with active member if selected
  React.useEffect(() => {
    if (activeMember) {
      setBookedByName(activeMember.name);
      setBookingEmail(activeMember.email);
    }
  }, [activeMember]);

  const carrels = ["Carrel A1", "Carrel A2", "Carrel B1", "Carrel B2"];
  const computers = ["PC Station #1", "PC Station #2", "PC Station #3", "PC Station #4"];
  const spaceOptions = spaceType === "Study Carrel" ? carrels : computers;

  const timeSlots = [
    "08:00 - 10:00",
    "10:00 - 12:00",
    "12:00 - 14:00",
    "14:00 - 16:00",
    "16:00 - 18:00"
  ];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace || !selectedTimeSlot || !bookedByName || !bookingEmail || !bookingDate) {
      setMessage({ type: "error", text: "Please complete all reservation fields." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await onAddBooking({
        spaceType,
        spaceName: selectedSpace,
        timeSlot: selectedTimeSlot,
        bookedBy: bookedByName,
        email: bookingEmail,
        bookingDate,
      });

      setMessage({
        type: "success",
        text: `Success! ${selectedSpace} has been booked for ${selectedTimeSlot} on ${bookingDate}.`,
      });
      // Clear selections but keep user info
      setSelectedSpace("");
      setSelectedTimeSlot("");
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to book study space.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string, spaceName: string) => {
    if (confirm(`Do you want to cancel the reservation for ${spaceName}?`)) {
      try {
        await onCancelBooking(id);
        setMessage({ type: "success", text: "Booking canceled successfully." });
      } catch (err: any) {
        setMessage({ type: "error", text: "Failed to erase booking session." });
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-900/10 p-6 shadow-xs" id="booking-section">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-6 border-b border-amber-500/10">
        <div>
          <h2 className="text-xl font-bold text-emerald-950 font-sans tracking-tight">
            Study Space & Tech Hub Seating Reservation
          </h2>
          <p className="text-xs text-emerald-800 font-medium">
            Active democratization policy: Limit of 1 slots per category per day during peak examinations.
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-3 py-1 text-emerald-800 font-bold rounded-lg mt-2 md:mt-0 text-xs flex items-center gap-1.5 self-start">
          <Calendar className="h-3.5 w-3.5 text-emerald-700" />
          <span>Real-time Scheduler Activated</span>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs mb-6 border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-900"
              : "bg-rose-50 border-rose-100 text-rose-900"
          }`}
          role="alert"
        >
          <div className="flex">
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 mr-2 shrink-0 text-emerald-700" />
            ) : (
              <ShieldAlert className="h-4 w-4 mr-2 shrink-0 text-rose-700" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reservation Form */}
        <div className="lg:col-span-4 bg-amber-50/15 p-5 rounded-xl border border-amber-900/5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-700 mb-4 font-bold">
            New Seating Reservation
          </h3>

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            {/* Space Type Selection */}
            <div>
              <label className="block text-xs font-bold text-emerald-950 uppercase mb-2">
                1. Select Hub Section
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="tab-carrel-booking"
                  type="button"
                  onClick={() => {
                    setSpaceType("Study Carrel");
                    setSelectedSpace("");
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-2 transition ${
                    spaceType === "Study Carrel"
                      ? "bg-emerald-700 text-amber-50 border-emerald-700 shadow-xs"
                      : "bg-white text-emerald-950 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Study Carrel</span>
                </button>

                <button
                  id="tab-pc-booking"
                  type="button"
                  onClick={() => {
                    setSpaceType("Computer Lab");
                    setSelectedSpace("");
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-2 transition ${
                    spaceType === "Computer Lab"
                      ? "bg-emerald-700 text-amber-50 border-emerald-700 shadow-xs"
                      : "bg-white text-emerald-950 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Laptop className="h-3.5 w-3.5" />
                  <span>Computer Hub</span>
                </button>
              </div>
            </div>

            {/* Target Space Spot */}
            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                2. Choose Seating Spot
              </label>
              <select
                id="booking-space-select"
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-emerald-950 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                value={selectedSpace}
                onChange={(e) => setSelectedSpace(e.target.value)}
                required
              >
                <option value="">-- Choose Spot --</option>
                {spaceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Target TimeSlot grid list */}
            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                3. Choose Time Slot
              </label>
              <select
                id="booking-timeslot-select"
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-emerald-950 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                required
              >
                <option value="">-- Choose Time Window --</option>
                {timeSlots.map((ts) => (
                  <option key={ts} value={ts}>
                    {ts}
                  </option>
                ))}
              </select>
            </div>

            {/* Booking Date */}
            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                4. Reservation Date
              </label>
              <input
                id="booking-date-input"
                type="date"
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-emerald-950 font-mono focus:outline-hidden"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                required
              />
            </div>

            {/* Member detail associations */}
            <div className="pt-2 border-t border-dashed border-amber-900/10 space-y-2.5">
              <div>
                <label className="flex items-center text-xs font-semibold text-emerald-950 mb-1">
                  <User className="h-3 w-3 mr-1 text-emerald-700" /> Full Name
                </label>
                <input
                  id="booking-name-input"
                  type="text"
                  placeholder="e.g., Akosua Nyamadi"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  value={bookedByName}
                  onChange={(e) => setBookedByName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-xs font-semibold text-emerald-950 mb-1">
                  <Mail className="h-3 w-3 mr-1 text-emerald-700" /> Registered Email
                </label>
                <input
                  id="booking-email-input"
                  type="email"
                  placeholder="name@gmail.com"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  value={bookingEmail}
                  onChange={(e) => setBookingEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              id="submit-booking-btn"
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-amber-100 font-bold p-2.5 rounded-lg text-xs tracking-wide cursor-pointer flex items-center justify-center space-x-1 duration-150 disabled:opacity-50"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{submitting ? "Booking Seating..." : "Confirm Reservation"}</span>
            </button>
          </form>
        </div>

        {/* Real-time occupied space matrix list */}
        <div className="lg:col-span-8">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-700 mb-4 font-bold flex items-center">
            <Monitor className="h-4 w-4 mr-1 text-amber-600" />
            <span>Assigned Reservations Matrix today & upcoming ({bookings.length})</span>
          </h3>

          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-xs text-slate-500 font-semibold">No reservations booked on catalog ledger yet.</p>
                <p className="text-[10px] text-slate-400">Be the first to secure a silent exam carrel or desktop workspace spot.</p>
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="min-w-full divide-y divide-slate-200 bg-white shadow-xs rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="px-4 py-3 text-left">Spot Name</th>
                      <th className="px-4 py-3 text-left">Section</th>
                      <th className="px-4 py-3 text-left">Recipient Member</th>
                      <th className="px-4 py-3 text-left">Time window</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-right">Erase Call</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((bk) => (
                      <tr key={bk.id} className="hover:bg-amber-50/10">
                        <td className="px-4 py-3 font-semibold text-emerald-950 font-mono">
                          {bk.spaceName}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              bk.spaceType === "Study Carrel"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-sky-100 text-sky-700"
                            }`}
                          >
                            {bk.spaceType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{bk.bookedBy}</div>
                          <div className="text-[10px] text-slate-500">{bk.email}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 tracking-tight font-mono">
                          {bk.timeSlot}
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-mono">
                          {bk.bookingDate}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            id={`cancel-booking-${bk.id}`}
                            onClick={() => handleCancel(bk.id, bk.spaceName)}
                            className="text-rose-600 hover:text-rose-800 p-1 bg-rose-50 hover:bg-rose-100 rounded-lg transition duration-150 inline-block focus:outline-hidden"
                            title="Cancel Reservation"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Informational Policy Alert box */}
          <div className="mt-5 bg-amber-50/40 border border-amber-900/10 p-4 rounded-xl text-xs flex gap-3 text-emerald-900">
            <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0" />
            <div>
              <h4 className="font-bold text-emerald-950 mb-0.5">Democratization Policy Rules</h4>
              <p className="text-[11px] leading-relaxed text-slate-600">
                To guarantee fair-sharing of resource terminals and silent carrels, every registered student ID is limited to <b>1 active study spot reservation</b> per category per day. Overbooking is tracked dynamically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
