"use client";

import React from "react";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Printer,
  Trash2,
  Bot,
} from "lucide-react";
import { EventPlan } from "@/types";
import { formatCurrency, getEventTypeBadge } from "@/lib/utils";
import { ExpenseReportModal } from "./ExpenseReportModal";

const EVENT_ILLUSTRATIONS: Record<string, string> = {
  birthday: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
  wedding: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  community_event: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80",
  anniversary: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
  custom: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
};

interface EventHeaderProps {
  event: EventPlan;
  onDeleteEvent: (id: string) => void;
  onOpenAICoPilot: () => void;
}

export const EventHeader: React.FC<EventHeaderProps> = ({
  event,
  onDeleteEvent,
  onOpenAICoPilot,
}) => {
  const badge = getEventTypeBadge(event.eventType);
  const bannerImage =
    EVENT_ILLUSTRATIONS[event.eventType] || EVENT_ILLUSTRATIONS.custom;

  const totalSpent = event.expenses.reduce(
    (sum, exp) => sum + (exp.paid ? exp.amount : 0),
    0
  );
  const totalAllocated = event.budgetAllocations.reduce(
    (sum, b) => sum + b.allocatedAmount,
    0
  );
  const budget = event.totalBudget || totalAllocated || 1;
  const spentPct = Math.min(100, Math.round((totalSpent / budget) * 100));
  const isOverBudget = totalSpent > budget;

  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [isExpenseReportOpen, setIsExpenseReportOpen] = React.useState(false);

  React.useEffect(() => {
    if (confirmDelete) {
      const timer = setTimeout(() => setConfirmDelete(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [confirmDelete]);

  // Days countdown calculation
  const getDaysRemaining = () => {
    if (!event.date) return null;
    const target = new Date(event.date).getTime();
    const now = new Date().getTime();
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();

  return (
    <section
      aria-label="Celebration Overview Header"
      className="relative overflow-hidden rounded-3xl border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000]"
    >
      {/* Top Retro-Pop Badge Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black bg-[#faf8f2] px-6 py-3.5 sm:px-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-full border-2 border-black bg-[#eefc27] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_#000]">
            {badge.label}
          </span>

          {daysRemaining !== null && (
            <span className="flex items-center gap-1.5 rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000]">
              <Calendar className="h-3.5 w-3.5 text-black" aria-hidden="true" />
              {daysRemaining > 0
                ? `${daysRemaining} Days to Go`
                : daysRemaining === 0
                  ? "Today is the Big Day!"
                  : `${Math.abs(daysRemaining)} Days Ago`}
            </span>
          )}

          <span className="rounded-full border-2 border-black bg-[#fcd2c2] px-3 py-1 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000]">
            {event.theme || "Personalized Celebration"}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="rounded-full border-1.5 border-black bg-[#c7f7d4] px-2.5 py-0.5 text-[11px] font-black text-black shadow-[1px_1px_0px_0px_#000]">
            ✨ Active Plan
          </span>
        </div>
      </div>

      {/* Main Header Body */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white">
        {/* Title, Meta Pills & Actions (Col 7) */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-black leading-[1.08]">
              {event.title}
            </h1>
          </div>

          {/* Meta Info Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-black">
            {event.date && (
              <div className="flex items-center gap-2 rounded-xl border-2 border-black bg-[#faf8f2] px-3 py-1.5 shadow-[2px_2px_0px_0px_#000]">
                <Calendar className="h-4 w-4 text-black flex-shrink-0" aria-hidden="true" />
                <span>
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 rounded-xl border-2 border-black bg-[#faf8f2] px-3 py-1.5 shadow-[2px_2px_0px_0px_#000]">
                <MapPin className="h-4 w-4 text-black flex-shrink-0" aria-hidden="true" />
                <span>{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl border-2 border-black bg-[#faf8f2] px-3 py-1.5 shadow-[2px_2px_0px_0px_#000]">
              <Users className="h-4 w-4 text-black flex-shrink-0" aria-hidden="true" />
              <span>{event.guestCount} Guests Target</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={onOpenAICoPilot}
              aria-label="Open Planora AI Co-Pilot Chat"
              className="neo-btn-primary px-5 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-2"
            >
              <Bot className="h-4 w-4 text-black" aria-hidden="true" />
              <span>Ask AI Co-Pilot</span>
            </button>

            <button
              onClick={() => setIsExpenseReportOpen(true)}
              aria-label="View and Print Expense & Budget Report"
              className="neo-btn px-4 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-2 hover:bg-[#faf8f2]"
              title="Print Expense Report"
            >
              <Printer className="h-4 w-4 text-black" aria-hidden="true" />
              <span>Print Expense Report</span>
            </button>

            {confirmDelete ? (
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  onDeleteEvent(event.id);
                }}
                aria-label="Confirm permanent deletion of this celebration"
                className="neo-btn bg-rose-500 text-white hover:bg-rose-600 px-4 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000] animate-pulse flex items-center gap-2"
                title="Click again to confirm delete"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Confirm Delete?</span>
              </button>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                aria-label={`Delete event ${event.title}`}
                className="neo-btn bg-[#fcd2c2] hover:bg-rose-400 px-3.5 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-2"
                title="Delete Celebration"
              >
                <Trash2 className="h-4 w-4 text-black" aria-hidden="true" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Budget & Health Metric Card (Col 5) */}
        <div className="lg:col-span-5">
          <div
            className="rounded-2xl border-2 border-black bg-[#faf8f2] p-5 shadow-[4px_4px_0px_0px_#000]"
            role="region"
            aria-label="Budget Progress Summary"
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border-1.5 border-black bg-[#eefc27] text-black shadow-[1.5px_1.5px_0px_0px_#000]">
                  <DollarSign className="h-4 w-4 text-black" />
                </div>
                <span className="text-xs font-black text-black uppercase tracking-wider">
                  Budget & Spending
                </span>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-black border-1.5 border-black shadow-[1px_1px_0px_0px_#000] ${
                  isOverBudget ? "bg-rose-400 text-black" : "bg-[#eefc27] text-black"
                }`}
              >
                {spentPct}% Spent
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-black text-black mb-1.5">
                <span>Total Spent</span>
                <span>{formatCurrency(totalSpent, event.currency)}</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={spentPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Budget utilization: ${spentPct} percent`}
                className="h-3.5 w-full overflow-hidden rounded-full border-2 border-black bg-white"
              >
                <div
                  className={`h-full transition-all duration-500 border-r-2 border-black ${
                    isOverBudget ? "bg-rose-500" : "bg-[#eefc27]"
                  }`}
                  style={{ width: `${Math.min(100, spentPct)}%` }}
                />
              </div>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2 pt-3 border-t-2 border-black/10 text-xs font-bold text-black">
              <div className="rounded-xl border-1.5 border-black bg-white p-2 text-center shadow-[1.5px_1.5px_0px_0px_#000]">
                <span className="text-[10px] uppercase text-slate-600 block">Total Budget</span>
                <span className="font-black text-black">
                  {formatCurrency(event.totalBudget, event.currency)}
                </span>
              </div>
              <div className="rounded-xl border-1.5 border-black bg-white p-2 text-center shadow-[1.5px_1.5px_0px_0px_#000]">
                <span className="text-[10px] uppercase text-slate-600 block">Remaining</span>
                <span className="font-black text-black">
                  {formatCurrency(
                    Math.max(0, event.totalBudget - totalSpent),
                    event.currency
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Printable Expense & Budget Report Modal */}
      <ExpenseReportModal
        isOpen={isExpenseReportOpen}
        onClose={() => setIsExpenseReportOpen(false)}
        event={event}
      />
    </section>
  );
};
