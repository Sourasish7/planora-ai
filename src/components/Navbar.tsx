"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  PlusCircle,
  Settings,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { EventPlan } from "@/types";
import { getEventTypeBadge } from "@/lib/utils";

interface NavbarProps {
  events: EventPlan[];
  currentEvent: EventPlan | null;
  onSelectEvent: (event: EventPlan) => void;
  onOpenNewEventModal: () => void;
  onOpenSettingsModal: () => void;
  onDeleteEvent?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  currentEvent,
  onSelectEvent,
  onOpenNewEventModal,
  onOpenSettingsModal,
  onDeleteEvent,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation: Escape key closes dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dropdownOpen) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dropdownOpen]);

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 w-full border-b-2 border-black bg-[#faf8f2] shadow-sm"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Neobrutalist Brand Logo (Matching Reference Image) */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] flex-shrink-0 items-center justify-center rounded-xl bg-[#eefc27] border-2 border-black shadow-[2px_2px_0px_0px_#000] select-none p-2 overflow-hidden">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 max-h-6 max-w-6 text-black flex-shrink-0"
              style={{ width: "24px", height: "24px", maxWidth: "24px", maxHeight: "24px" }}
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-black">
                Planora<span className="text-black font-bold">.ai</span>
              </span>
              <span className="hidden rounded-full border-2 border-black bg-[#c2e9fb] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-[1.5px_1.5px_0px_0px_#000] sm:inline-block">
                Event Planner
              </span>
            </div>
            <p className="hidden text-[11px] font-bold text-slate-700 sm:block">
              Intelligent Event Planning Assistant
            </p>
          </div>
        </div>

        {/* Current Event Selector & Actions */}
        <nav role="navigation" aria-label="Celebration Switcher and Controls" className="flex items-center gap-2 sm:gap-3">
          {/* Event Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
              aria-label={`Current Celebration: ${currentEvent ? currentEvent.title : "No Celebration"}`}
              className="flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-black shadow-[2.5px_2.5px_0px_0px_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              <Calendar className="h-4 w-4 text-black" aria-hidden="true" />
              <span className="max-w-[120px] truncate sm:max-w-[200px]">
                {currentEvent ? currentEvent.title : "No Events Planned"}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-black transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                  aria-hidden="true"
                />
                <div
                  role="listbox"
                  aria-label="Available Events"
                  className="absolute right-0 top-full z-50 mt-2 w-84 sm:w-96 max-w-[92vw] rounded-2xl border-2 border-black bg-[#faf8f2] p-3 shadow-[6px_6px_0px_0px_#000] animate-fade-in"
                >
                  <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b-2 border-black text-[11px] font-black uppercase tracking-wider text-black">
                    <span>Celebrations</span>
                    <span className="rounded-full bg-[#eefc27] border-2 border-black px-2 py-0.2 text-[10px] font-bold text-black shadow-[1px_1px_0px_0px_#000]">
                      {events.length} Active
                    </span>
                  </div>

                  <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
                    {events.length === 0 ? (
                      <div className="py-6 px-3 text-center text-xs text-slate-600">
                        <Calendar className="mx-auto h-7 w-7 text-black mb-1.5" />
                        <p className="font-bold text-black">No events yet</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">Click below to generate your first event!</p>
                      </div>
                    ) : (
                      events.map((evt) => {
                        const badge = getEventTypeBadge(evt.eventType);
                        const isSelected = currentEvent?.id === evt.id;
                        return (
                          <div
                            key={evt.id}
                            className={`group flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition-all border-2 ${
                              isSelected
                                ? "bg-[#eefc27] text-black border-black shadow-[2px_2px_0px_0px_#000]"
                                : "text-black bg-white hover:bg-[#fcd2c2] border-black shadow-[1.5px_1.5px_0px_0px_#000]"
                            }`}
                          >
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                onSelectEvent(evt);
                                setDropdownOpen(false);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  onSelectEvent(evt);
                                  setDropdownOpen(false);
                                }
                              }}
                              className="flex-1 cursor-pointer space-y-0.5 truncate pr-2"
                            >
                              <div className="flex items-center gap-1.5 font-bold text-black">
                                <span className="truncate">{evt.title}</span>
                                {isSelected && (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-black flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-700">
                                <span>{evt.date || "Date TBA"}</span>
                                <span>•</span>
                                <span>{evt.guestCount} guests</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span
                                className="rounded-full border-1.5 border-black bg-white px-2 py-0.5 text-[10px] font-bold text-black shadow-[1px_1px_0px_0px_#000]"
                              >
                                {badge.label}
                              </span>
                              {onDeleteEvent && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteEvent(evt.id);
                                  }}
                                  aria-label={`Delete event ${evt.title}`}
                                  title="Delete event"
                                  className="p-1 rounded-lg border-1.5 border-black bg-white hover:bg-rose-400 text-black shadow-[1px_1px_0px_0px_#000] transition-all"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="mt-2.5 border-t-2 border-black pt-2.5">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenNewEventModal();
                      }}
                      className="neo-btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
                    >
                      <PlusCircle className="h-4 w-4" aria-hidden="true" />
                      <span>Generate New Event</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* New Event CTA in Vibrant Yellow Pill Style */}
          <button
            onClick={onOpenNewEventModal}
            aria-label="Open AI Event Planner Wizard"
            className="neo-btn-primary flex items-center gap-2 px-4 py-2 text-xs font-black shadow-[3px_3px_0px_0px_#000] hidden sm:flex"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>New Celebration</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettingsModal}
            aria-label="Open Planora AI Settings and API Key Configuration"
            className="neo-btn flex h-9 w-9 items-center justify-center p-0 shadow-[2px_2px_0px_0px_#000]"
            title="AI Settings & API Key"
          >
            <Settings className="h-4 w-4 text-black" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>
  );
};
