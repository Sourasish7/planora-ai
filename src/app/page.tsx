"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { EventHeader } from "@/components/EventHeader";
import { TabNavigation, ActiveTab } from "@/components/TabNavigation";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { BudgetTab } from "@/components/tabs/BudgetTab";
import { TimelineTab } from "@/components/tabs/TimelineTab";
import { VendorsTab } from "@/components/tabs/VendorsTab";
import { IdeasTab } from "@/components/tabs/IdeasTab";
import { AICopilotTab } from "@/components/tabs/AICopilotTab";
import dynamic from "next/dynamic";
import { PrintableExpenseReport } from "@/components/PrintableExpenseReport";

// Dynamic code splitting for heavy interactive modals to optimize initial bundle size & TTI
const NewEventModal = dynamic(
  () => import("@/components/NewEventModal").then((mod) => mod.NewEventModal),
  { ssr: false }
);
const SettingsModal = dynamic(
  () => import("@/components/SettingsModal").then((mod) => mod.SettingsModal),
  { ssr: false }
);
import {
  EventPlan,
  GenerateEventPlanInput,
  BudgetItem,
  Expense,
  Milestone,
  RunOfShowItem,
  Vendor,
} from "@/types";
import { Loader2, Plus, Calendar } from "lucide-react";

export default function Home() {
  const [events, setEvents] = useState<EventPlan[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventPlan | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [generating, setGenerating] = useState(false);
  const [aiChatLoading, setAiChatLoading] = useState(false);

  // Modals
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Settings
  const [settings, setSettings] = useState<{
    apiKey?: string;
    aiProvider: "auto" | "gemini" | "openai";
    aiModel?: string;
    preferredCurrency: string;
  }>({
    aiProvider: "auto",
    aiModel: "",
    preferredCurrency: "USD",
  });

  // Fetch initial events & settings in background
  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (!res.ok) return;
      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        setEvents(data.events);
        setCurrentEvent((prev) => {
          if (prev) {
            const matched = data.events.find((e: EventPlan) => e.id === prev.id);
            if (matched) return matched;
          }
          return data.events.length > 0 ? data.events[0] : null;
        });
      }
    } catch (err) {
      console.warn("Using local cached events:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchSettings();
  }, []);

  // Refresh single event from server
  const refreshCurrentEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      if (data.event) {
        setCurrentEvent(data.event);
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? data.event : e))
        );
      }
    } catch (err) {
      console.error("Failed to refresh event:", err);
    }
  };

  // Actions: Create Event
  const handleCreateEvent = async (input: GenerateEventPlanInput) => {
    try {
      setGenerating(true);
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data.event) {
        setEvents((prev) => [data.event, ...prev]);
        setCurrentEvent(data.event);
        setIsNewEventModalOpen(false);
        setActiveTab("overview");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Actions: Delete Event
  const handleDeleteEvent = async (id: string) => {
    try {
      // Optimistic update
      const remaining = events.filter((e) => e.id !== id);
      setEvents(remaining);
      if (currentEvent?.id === id) {
        setCurrentEvent(remaining.length > 0 ? remaining[0] : null);
      }

      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) {
        console.error("Delete failed on server:", await res.text());
        fetchEvents();
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
      fetchEvents();
    }
  };

  // Actions: Budget
  const handleAddBudgetItem = async (item: Omit<BudgetItem, "id">) => {
    if (!currentEvent) return;
    await fetch(`/api/events/${currentEvent.id}/budget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "allocation", data: item }),
    });
    await refreshCurrentEvent(currentEvent.id);
  };

  const handleUpdateBudgetItem = async (
    itemId: string,
    updates: Partial<BudgetItem>
  ) => {
    if (!currentEvent) return;
    await fetch(`/api/events/${currentEvent.id}/budget`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "allocation", itemId, updates }),
    });
    await refreshCurrentEvent(currentEvent.id);
  };

  const handleDeleteBudgetItem = async (itemId: string) => {
    if (!currentEvent) return;
    await fetch(
      `/api/events/${currentEvent.id}/budget?type=allocation&itemId=${itemId}`,
      { method: "DELETE" }
    );
    await refreshCurrentEvent(currentEvent.id);
  };

  const handleAddExpense = async (expense: Omit<Expense, "id">) => {
    if (!currentEvent) return;
    await fetch(`/api/events/${currentEvent.id}/budget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "expense", data: expense }),
    });
    await refreshCurrentEvent(currentEvent.id);
  };

  const handleUpdateExpense = async (
    expenseId: string,
    updates: Partial<Expense>
  ) => {
    if (!currentEvent) return;
    await fetch(`/api/events/${currentEvent.id}/budget`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "expense", itemId: expenseId, updates }),
    });
    await refreshCurrentEvent(currentEvent.id);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!currentEvent) return;
    await fetch(
      `/api/events/${currentEvent.id}/budget?type=expense&itemId=${expenseId}`,
      { method: "DELETE" }
    );
    await refreshCurrentEvent(currentEvent.id);
  };

  // Actions: Milestones
  const handleAddMilestone = async (milestone: Omit<Milestone, "id">) => {
    if (!currentEvent) return;
    await fetch(`/api/events/${currentEvent.id}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(milestone),
    });
    await refreshCurrentEvent(currentEvent.id);
  };

  const handleUpdateMilestone = async (
    milestoneId: string,
    updates: Partial<Milestone>
  ) => {
    if (!currentEvent) return;
    await fetch(`/api/events/${currentEvent.id}/milestones`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestoneId, updates }),
    });
    await refreshCurrentEvent(currentEvent.id);
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!currentEvent) return;
    await fetch(
      `/api/events/${currentEvent.id}/milestones?milestoneId=${milestoneId}`,
      { method: "DELETE" }
    );
    await refreshCurrentEvent(currentEvent.id);
  };

  // Actions: Run of Show
  const handleAddRunOfShowItem = async (item: Omit<RunOfShowItem, "id">) => {
    if (!currentEvent) return;
    await fetch(`/api/events/${currentEvent.id}/run-of-show`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    await refreshCurrentEvent(currentEvent.id);
  };

  const handleUpdateRunOfShowItem = async (
    itemId: string,
    updates: Partial<RunOfShowItem>
  ) => {
    if (!currentEvent) return;
    await fetch(`/api/events/${currentEvent.id}/run-of-show`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, updates }),
    });
    await refreshCurrentEvent(currentEvent.id);
  };

  const handleDeleteRunOfShowItem = async (itemId: string) => {
    if (!currentEvent) return;
    await fetch(
      `/api/events/${currentEvent.id}/run-of-show?itemId=${itemId}`,
      { method: "DELETE" }
    );
    await refreshCurrentEvent(currentEvent.id);
  };

  // Actions: Vendors
  const handleAddVendor = async (vendor: Omit<Vendor, "id">) => {
    if (!currentEvent) return;
    await fetch(`/api/events/${currentEvent.id}/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendor),
    });
    await refreshCurrentEvent(currentEvent.id);
  };

  const handleUpdateVendor = async (
    vendorId: string,
    updates: Partial<Vendor>
  ) => {
    if (!currentEvent) return;
    await fetch(`/api/events/${currentEvent.id}/vendors`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId, updates }),
    });
    await refreshCurrentEvent(currentEvent.id);
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!currentEvent) return;
    await fetch(
      `/api/events/${currentEvent.id}/vendors?vendorId=${vendorId}`,
      { method: "DELETE" }
    );
    await refreshCurrentEvent(currentEvent.id);
  };

  // Actions: AI Chat
  const handleSendAIChat = async (message: string) => {
    if (!currentEvent) return;
    try {
      setAiChatLoading(true);
      const res = await fetch(`/api/events/${currentEvent.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          apiKey: settings.apiKey,
          provider: settings.aiProvider,
          model: settings.aiModel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshCurrentEvent(currentEvent.id);
      }
    } catch (err) {
      console.error("AI Chat failed:", err);
    } finally {
      setAiChatLoading(false);
    }
  };

  // Settings & Actions
  const handleSaveSettings = async (newSettings: {
    apiKey?: string;
    aiProvider: "auto" | "gemini" | "openai";
    aiModel?: string;
    preferredCurrency: string;
  }) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  return (
    <div className="min-h-screen print:min-h-0 print:bg-white bg-[#faf8f2] text-slate-900 flex flex-col selection:bg-[#eefc27] selection:text-black relative">
      {/* Neobrutalist Subtle Warm Dot Canvas */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(#d6d2c4_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-60"
        aria-hidden="true"
      />

      {/* Top Navbar */}
      <Navbar
        events={events}
        currentEvent={currentEvent}
        onSelectEvent={(evt) => {
          setCurrentEvent(evt);
          setActiveTab("overview");
        }}
        onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onDeleteEvent={handleDeleteEvent}
      />

      {/* Dedicated Print-Only Expense Report: Ensures Page 1 always prints clean expense report */}
      {currentEvent && (
        <div className="print-report-container hidden print:block">
          <PrintableExpenseReport event={currentEvent} />
        </div>
      )}

      {/* Main Content Area */}
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 outline-none print:hidden"
      >
        {currentEvent ? (
          <>
            {/* Event Header Banner */}
            <EventHeader
              event={currentEvent}
              onDeleteEvent={handleDeleteEvent}
              onOpenAICoPilot={() => setActiveTab("ai")}
            />

            {/* Tab Navigation */}
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              vendorCount={currentEvent.vendors.length}
            />

            {/* Active Tab Panel with Accessible ARIA container */}
            <div
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              className="pb-16 outline-none"
            >
              {activeTab === "overview" && (
                <OverviewTab
                  event={currentEvent}
                  onNavigateTab={setActiveTab}
                  onOpenNewMilestone={() => setActiveTab("timeline")}
                />
              )}

              {activeTab === "budget" && (
                <BudgetTab
                  event={currentEvent}
                  onAddBudgetItem={handleAddBudgetItem}
                  onUpdateBudgetItem={handleUpdateBudgetItem}
                  onDeleteBudgetItem={handleDeleteBudgetItem}
                  onAddExpense={handleAddExpense}
                  onUpdateExpense={handleUpdateExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}

              {activeTab === "timeline" && (
                <TimelineTab
                  event={currentEvent}
                  onAddMilestone={handleAddMilestone}
                  onUpdateMilestone={handleUpdateMilestone}
                  onDeleteMilestone={handleDeleteMilestone}
                  onAddRunOfShowItem={handleAddRunOfShowItem}
                  onUpdateRunOfShowItem={handleUpdateRunOfShowItem}
                  onDeleteRunOfShowItem={handleDeleteRunOfShowItem}
                />
              )}

              {activeTab === "vendors" && (
                <VendorsTab
                  event={currentEvent}
                  onAddVendor={handleAddVendor}
                  onUpdateVendor={handleUpdateVendor}
                  onDeleteVendor={handleDeleteVendor}
                />
              )}

              {activeTab === "ideas" && <IdeasTab event={currentEvent} />}

              {activeTab === "ai" && (
                <AICopilotTab
                  event={currentEvent}
                  onSendMessage={handleSendAIChat}
                  onNavigateTab={setActiveTab}
                  isLoading={aiChatLoading}
                />
              )}
            </div>
          </>
        ) : (
          /* Neobrutalist Hero & Direct Planner Workspace — Matching Reference UI */
          <div className="space-y-10 animate-fade-in text-black my-4">
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-4">
              <div className="space-y-5">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.08]">
                  Plan celebrations <br />
                  <span className="underline decoration-4 decoration-[#eefc27]">with intelligence</span>
                </h1>
                <p className="text-sm sm:text-base font-bold text-slate-700 max-w-lg leading-relaxed">
                  A GenAI-powered planning assistant for weddings, birthdays, anniversaries, and community gatherings with autonomous budgets, timelines, and vendor checklists.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsNewEventModalOpen(true)}
                    className="neo-btn-primary px-6 py-3 text-sm font-black shadow-[3px_3px_0px_0px_#000]"
                  >
                    <span>Get started today</span>
                  </button>
                  <button
                    onClick={() => {
                      const formEl = document.getElementById("direct-planner-form");
                      formEl?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="neo-btn px-6 py-3 text-sm font-black shadow-[3px_3px_0px_0px_#000]"
                  >
                    <span>Quick Plan</span>
                  </button>
                </div>
              </div>

              {/* Hand-drawn celebration crowd illustration */}
              <div className="flex items-center justify-center p-2">
                <img
                  src="https://i.ibb.co/LDjFdZs7/image-removebg-preview.png"
                  alt="Planora AI Illustration"
                  className="w-full max-h-[360px] object-contain transition-transform hover:scale-105 duration-300"
                />
              </div>
            </div>

            {/* Two Bottom Cards: Peach & Yellow (Identical to user reference) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Card - Peach */}
              <div className="rounded-3xl border-2 border-black bg-[#fcd2c2] p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border-2 border-black bg-white px-3 py-0.5 text-xs font-black shadow-[1.5px_1.5px_0px_0px_#000]">
                    Smart Allocator
                  </span>
                </div>
                <h3 className="text-2xl font-black text-black">
                  Balanced Budget & Vendors
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                  All category breakdowns calculated dynamically with contingency buffers, vendor payment schedules, and instant printable reports.
                </p>
                <div className="pt-2">
                  <span className="font-black text-black underline cursor-pointer text-xs sm:text-sm">
                    Automated cost optimization
                  </span>
                </div>
              </div>

              {/* Right Card - Yellow */}
              <div className="rounded-3xl border-2 border-black bg-[#eefc27] p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border-2 border-black bg-white px-3 py-0.5 text-xs font-black shadow-[1.5px_1.5px_0px_0px_#000]">
                    24/7 Co-Pilot
                  </span>
                </div>
                <h3 className="text-2xl font-black text-black">
                  Autonomous AI Assistant
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                  Planora answers budget cuts, draft toasts, emergency checklists, and icebreaker games calibrated strictly to your celebration details.
                </p>
                <div className="pt-2">
                  <span className="font-black text-black underline cursor-pointer text-xs sm:text-sm">
                    Ask anything, anytime
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Flat Planner Form */}
            <div
              id="direct-planner-form"
              className="rounded-3xl border-2 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] space-y-6 max-w-3xl mx-auto"
            >
              <div className="flex items-center gap-3 pb-4 border-b-2 border-black">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-[#eefc27] text-black font-black shadow-[2px_2px_0px_0px_#000]">
                  <Calendar className="h-5 w-5 text-black" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black tracking-tight">Create Celebration</h2>
                  <p className="text-xs font-bold text-slate-700">Synthesize budgets, run-of-show itinerary, vendors, and aesthetic themes.</p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                  const eventType = (form.elements.namedItem("eventType") as HTMLSelectElement).value;
                  const budgetRaw = (form.elements.namedItem("budget") as HTMLInputElement).value;
                  const parsedBudget = parseFloat(budgetRaw);
                  const budget = !isNaN(parsedBudget) ? Math.max(0, parsedBudget) : 1000;

                  const guestRaw = (form.elements.namedItem("guestCount") as HTMLInputElement).value;
                  const parsedGuests = parseInt(guestRaw, 10);
                  const guestCount = !isNaN(parsedGuests) && parsedGuests > 0 ? Math.max(1, parsedGuests) : 10;

                  const date = (form.elements.namedItem("date") as HTMLInputElement).value;
                  const location = (form.elements.namedItem("location") as HTMLInputElement).value;
                  handleCreateEvent({
                    title,
                    eventType: eventType as any,
                    budget,
                    guestCount,
                    date,
                    location,
                    currency: "USD",
                  });
                }}
                className="space-y-4 text-xs font-bold"
              >
                <div>
                  <label className="text-black">
                    Celebration Title <span className="text-rose-600">*</span>
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="e.g. Maya & Alex's Royal Wedding / Mira's 30th Birthday Bash"
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-3 text-sm font-bold text-black placeholder-slate-400 focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-black">Event Type</label>
                    <select
                      name="eventType"
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
                      name="date"
                      type="date"
                      className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-black">Total Budget (USD)</label>
                    <input
                      name="budget"
                      type="number"
                      min="1"
                      defaultValue={15000}
                      className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                    />
                  </div>

                  <div>
                    <label className="text-black">Estimated Guests</label>
                    <input
                      name="guestCount"
                      type="number"
                      min="1"
                      defaultValue={80}
                      className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-black">Venue / Location</label>
                  <input
                    name="location"
                    type="text"
                    placeholder="e.g. Grand Plaza Ballroom or Central City Park"
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={generating}
                    className="w-full neo-btn-primary py-3.5 text-sm font-black shadow-[3px_3px_0px_0px_#000] disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black mr-2" />
                        <span>Synthesizing Complete Event Plan...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 text-black mr-2" />
                        <span>Generate Complete Event Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer in Neobrutalist Style */}
      <footer
        role="contentinfo"
        className="relative z-10 border-t-2 border-black bg-[#faf8f2] py-6 text-center text-xs font-bold text-slate-800"
      >
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-black">Planora AI</span>
            <span>•</span>
            <span>Hack2Skill Celebration & Event Planning Challenge</span>
          </div>
          <div>
            Built with ❤️
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onSubmit={handleCreateEvent}
        isLoading={generating}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        apiKey={settings.apiKey}
        aiProvider={settings.aiProvider}
        aiModel={settings.aiModel}
        preferredCurrency={settings.preferredCurrency}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
