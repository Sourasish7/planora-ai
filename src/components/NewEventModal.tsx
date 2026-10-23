"use client";

import React, { useState } from "react";
import {
  Plus,
  X,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Palette,
  Loader2,
  Zap,
} from "lucide-react";
import { EventType, GenerateEventPlanInput } from "@/types";

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: GenerateEventPlanInput) => Promise<void>;
  isLoading: boolean;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("25000");
  const [currency, setCurrency] = useState("USD");
  const [guestCount, setGuestCount] = useState("120");
  const [location, setLocation] = useState("");
  const [stylePreferences, setStylePreferences] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  if (!isOpen) return null;

  // Smart suggestions when typing
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const lower = val.toLowerCase();
    if (lower.includes("wedding") || lower.includes("reception") || lower.includes("marriage")) {
      setEventType("wedding");
      if (budget === "25000") setBudget("35000");
    } else if (lower.includes("birthday") || lower.includes("bday") || lower.includes("turning")) {
      setEventType("birthday");
      if (budget === "25000") setBudget("5000");
      if (guestCount === "120") setGuestCount("40");
    } else if (
      lower.includes("festival") ||
      lower.includes("community") ||
      lower.includes("fair") ||
      lower.includes("charity")
    ) {
      setEventType("community_event");
      if (budget === "25000") setBudget("15000");
      if (guestCount === "120") setGuestCount("350");
    } else if (lower.includes("anniversary")) {
      setEventType("anniversary");
      if (budget === "25000") setBudget("8000");
      if (guestCount === "120") setGuestCount("60");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    const parsedBudget = parseFloat(budget);
    const parsedGuests = parseInt(guestCount, 10);

    await onSubmit({
      title: title.trim(),
      eventType,
      date,
      budget: !isNaN(parsedBudget) ? Math.max(0, parsedBudget) : 1000,
      currency,
      guestCount: !isNaN(parsedGuests) && parsedGuests > 0 ? Math.max(1, parsedGuests) : 10,
      location: location.trim(),
      stylePreferences: stylePreferences.trim(),
      specialRequests: specialRequests.trim(),
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-new-event-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl rounded-3xl border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] max-h-[92vh] overflow-y-auto text-black">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-[#eefc27] text-black font-black shadow-[2px_2px_0px_0px_#000]">
              <Calendar className="h-5 w-5 text-black" aria-hidden="true" />
            </div>
            <div>
              <h3 id="modal-new-event-title" className="text-xl font-black text-black">
                Create Event with Planora AI
              </h3>
              <p className="text-xs font-bold text-slate-700">
                AI will calculate budgets, hourly run-of-show, vendor checklists & theme vibes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
            className="text-black hover:text-rose-600 p-1 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs font-bold">
          <div>
            <label className="text-black">
              Celebration Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maya & Alex's Royal Wedding / Mira's 30th Birthday Bash"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-3 text-sm font-bold text-black placeholder-slate-400 focus:outline-none shadow-[2px_2px_0px_0px_#000]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-black">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
              >
                <option value="wedding">💍 Wedding</option>
                <option value="birthday">🎂 Birthday Party</option>
                <option value="community_event">🌳 Community Event / Fair</option>
                <option value="anniversary">🥂 Anniversary Celebration</option>
              </select>
            </div>

            <div>
              <label className="text-black">Target Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-black">Total Budget</label>
              <div className="relative mt-1">
                <input
                  type="number"
                  required
                  min="1"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                />
              </div>
            </div>

            <div>
              <label className="text-black">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            <div>
              <label className="text-black">Estimated Guests</label>
              <input
                type="number"
                required
                min="1"
                max="50000"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
              />
            </div>
          </div>

          <div>
            <label className="text-black">Venue / Location</label>
            <input
              type="text"
              placeholder="e.g. Grand Plaza Ballroom, Seattle or Central City Park"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
            />
          </div>

          <div>
            <label className="text-black">
              Style, Theme & Vibe Preferences
            </label>
            <input
              type="text"
              placeholder="e.g. Modern minimalist ivory with eucalyptus greenery, acoustic jazz ambiance"
              value={stylePreferences}
              onChange={(e) => setStylePreferences(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
            />
          </div>

          <div>
            <label className="text-black">
              Special Requests & Constraints (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Needs vegan catering, outdoor curfew by 11 PM, couple loves live saxophone"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="neo-btn px-5 py-2.5 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title}
              className="neo-btn-primary px-6 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Synthesizing Planora Blueprint...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-black" />
                  <span>Generate Complete Event Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
