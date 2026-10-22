"use client";

import React, { useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  MapPin,
  User,
  Printer,
  X,
  AlertCircle,
} from "lucide-react";
import { EventPlan, Milestone, RunOfShowItem } from "@/types";

interface TimelineTabProps {
  event: EventPlan;
  onAddMilestone: (milestone: Omit<Milestone, "id">) => Promise<void>;
  onUpdateMilestone: (milestoneId: string, updates: Partial<Milestone>) => Promise<void>;
  onDeleteMilestone: (milestoneId: string) => Promise<void>;
  onAddRunOfShowItem: (item: Omit<RunOfShowItem, "id">) => Promise<void>;
  onUpdateRunOfShowItem: (itemId: string, updates: Partial<RunOfShowItem>) => Promise<void>;
  onDeleteRunOfShowItem: (itemId: string) => Promise<void>;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  event,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  onAddRunOfShowItem,
  onUpdateRunOfShowItem,
  onDeleteRunOfShowItem,
}) => {
  const [activeSubView, setActiveSubView] = useState<"milestones" | "runOfShow">(
    "milestones"
  );
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [showAddRunOfShowModal, setShowAddRunOfShowModal] = useState(false);

  // New Milestone Form State
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneTimeframe, setMilestoneTimeframe] = useState("3 Months Before");
  const [milestoneDueDate, setMilestoneDueDate] = useState("");
  const [milestoneAssignedTo, setMilestoneAssignedTo] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");

  // New Run of Show Item Form State
  const [runOfShowTime, setRunOfShowTime] = useState("");
  const [runOfShowActivity, setRunOfShowActivity] = useState("");
  const [runOfShowPerson, setRunOfShowPerson] = useState("");
  const [runOfShowLocation, setRunOfShowLocation] = useState("");
  const [runOfShowNotes, setRunOfShowNotes] = useState("");

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle) return;

    await onAddMilestone({
      title: milestoneTitle.trim(),
      timeframe: milestoneTimeframe,
      dueDate: milestoneDueDate,
      assignedTo: milestoneAssignedTo.trim() || undefined,
      description: milestoneDescription.trim() || "",
      completed: false,
    });

    setMilestoneTitle("");
    setMilestoneDueDate("");
    setMilestoneAssignedTo("");
    setMilestoneDescription("");
    setShowAddMilestoneModal(false);
  };

  const handleCreateRunOfShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runOfShowTime || !runOfShowActivity) return;

    await onAddRunOfShowItem({
      time: runOfShowTime.trim(),
      activity: runOfShowActivity.trim(),
      personInCharge: runOfShowPerson.trim() || "Host",
      location: runOfShowLocation.trim() || event.location || "Main Hall",
      notes: runOfShowNotes.trim() || undefined,
      status: "upcoming",
    });

    setRunOfShowTime("");
    setRunOfShowActivity("");
    setRunOfShowPerson("");
    setRunOfShowLocation("");
    setRunOfShowNotes("");
    setShowAddRunOfShowModal(false);
  };

  const completedMilestones = event.milestones.filter((m) => m.completed).length;
  const milestonePct =
    event.milestones.length > 0
      ? Math.round((completedMilestones / event.milestones.length) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-fade-in text-black">
      {/* Sub-view toggle & Actions Bar in Neobrutalist Style */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-2xl border-2 border-black bg-white p-1 text-xs shadow-[3px_3px_0px_0px_#000]">
          <button
            onClick={() => setActiveSubView("milestones")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-black transition-all ${
              activeSubView === "milestones"
                ? "bg-[#eefc27] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]"
                : "text-black hover:bg-[#faf8f2]"
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-black" />
            <span>Planning Checklist ({event.milestones.length})</span>
          </button>
          <button
            onClick={() => setActiveSubView("runOfShow")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-black transition-all ${
              activeSubView === "runOfShow"
                ? "bg-[#eefc27] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]"
                : "text-black hover:bg-[#faf8f2]"
            }`}
          >
            <Clock className="h-4 w-4 text-black" />
            <span>Day-of Run of Show ({event.runOfShow.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubView === "milestones" ? (
            <button
              onClick={() => setShowAddMilestoneModal(true)}
              className="neo-btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
            >
              <Plus className="h-4 w-4 text-black" />
              <span>Add Milestone</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => window.print()}
                className="neo-btn flex items-center gap-1.5 px-3.5 py-2 text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                title="Print Run of Show Sheet"
              >
                <Printer className="h-3.5 w-3.5 text-black" />
                <span>Print Schedule</span>
              </button>
              <button
                onClick={() => setShowAddRunOfShowModal(true)}
                className="neo-btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
              >
                <Plus className="h-4 w-4 text-black" />
                <span>Add Time Block</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* VIEW 1: Milestones Checklist */}
      {activeSubView === "milestones" && (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-black text-lg">
                  Milestone Completion Tracker
                </h4>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  Chronological checklist generated by AI for your {event.eventType.replace("_", " ")} lead time.
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-black">
                  {completedMilestones} / {event.milestones.length}
                </span>
                <span className="text-xs font-bold text-slate-700 block">{milestonePct}% Complete</span>
              </div>
            </div>

            <div className="mt-4 h-3 w-full rounded-full border-2 border-black bg-[#faf8f2] overflow-hidden">
              <div
                className="h-full border-r-2 border-black bg-[#eefc27] transition-all duration-500"
                style={{ width: `${milestonePct}%` }}
              />
            </div>
          </div>

          {/* Milestones List */}
          <div className="space-y-3">
            {event.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`rounded-2xl border-2 border-black p-4 flex items-start justify-between gap-4 shadow-[3px_3px_0px_0px_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] ${
                  milestone.completed
                    ? "bg-[#c7f7d4]"
                    : "bg-white"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() =>
                      onUpdateMilestone(milestone.id, {
                        completed: !milestone.completed,
                      })
                    }
                    className="mt-0.5 flex-shrink-0 text-black hover:text-emerald-700 transition-colors"
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-black" />
                    ) : (
                      <Circle className="h-5 w-5 text-black" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border-1.5 border-black bg-[#c2e9fb] px-2.5 py-0.5 text-[10px] font-black text-black shadow-[1px_1px_0px_0px_#000]">
                        {milestone.timeframe}
                      </span>
                      {milestone.dueDate && (
                        <span className="rounded-full border-1.5 border-black bg-white px-2 py-0.5 text-[10px] font-bold text-black">
                          Due: {milestone.dueDate}
                        </span>
                      )}
                      {milestone.assignedTo && (
                        <span className="rounded-full border-1.5 border-black bg-[#fcd2c2] px-2 py-0.5 text-[10px] font-bold text-black">
                          Assignee: {milestone.assignedTo}
                        </span>
                      )}
                    </div>

                    <h5
                      className={`text-sm font-black ${
                        milestone.completed
                          ? "line-through text-slate-600"
                          : "text-black"
                      }`}
                    >
                      {milestone.title}
                    </h5>

                    {milestone.description && (
                      <p className="text-xs font-medium text-slate-800 leading-relaxed">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMilestone(milestone.id)}
                  className="text-black hover:text-rose-600 p-1 transition-colors flex-shrink-0"
                  title="Delete milestone"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: Day-of Run of Show */}
      {activeSubView === "runOfShow" && (
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000]">
            <h4 className="font-black text-black text-lg">
              Day-of Event Master Schedule & Run of Show
            </h4>
            <p className="text-xs font-bold text-slate-700 mt-0.5">
              Hour-by-hour operational cues for MC, vendors, audio techs, and family leads.
            </p>
          </div>

          <div className="space-y-3">
            {event.runOfShow.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border-2 border-black bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Time Pillar */}
                  <div className="flex flex-col items-center justify-center min-w-[90px] rounded-xl border-2 border-black bg-[#eefc27] py-2 px-3 shadow-[2px_2px_0px_0px_#000]">
                    <Clock className="h-4 w-4 text-black mb-0.5" />
                    <span className="font-mono text-xs font-black text-black">
                      {item.time}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-black text-base text-black">{item.activity}</h5>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-black" />
                        {item.personInCharge}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-black" />
                        {item.location}
                      </span>
                      {item.notes && (
                        <>
                          <span>•</span>
                          <span className="text-slate-900 font-medium italic">{item.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Toggle & Delete */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      onUpdateRunOfShowItem(item.id, {
                        status: e.target.value as RunOfShowItem["status"],
                      })
                    }
                    className="rounded-xl border-2 border-black bg-[#faf8f2] px-3 py-1 text-xs font-black uppercase tracking-wider text-black focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    onClick={() => onDeleteRunOfShowItem(item.id)}
                    className="text-black hover:text-rose-600 p-1.5 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Milestone */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] animate-fade-in text-black">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h4 className="text-lg font-black text-black">Add Timeline Milestone</h4>
              <button
                onClick={() => setShowAddMilestoneModal(false)}
                className="text-black hover:text-rose-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="mt-4 space-y-4 text-xs font-bold">
              <div>
                <label className="text-black">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finalize Catering Contract, Send Invitations"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-black">Timeframe Phase</label>
                  <select
                    value={milestoneTimeframe}
                    onChange={(e) => setMilestoneTimeframe(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  >
                    <option value="6+ Months Before">6+ Months Before</option>
                    <option value="3-5 Months Before">3-5 Months Before</option>
                    <option value="1-2 Months Before">1-2 Months Before</option>
                    <option value="2-3 Weeks Before">2-3 Weeks Before</option>
                    <option value="Final Week Before">Final Week Before</option>
                    <option value="Day-Of">Day-Of</option>
                  </select>
                </div>

                <div>
                  <label className="text-black">Target Due Date</label>
                  <input
                    type="date"
                    value={milestoneDueDate}
                    onChange={(e) => setMilestoneDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div>
                <label className="text-black">Assigned Lead / Person</label>
                <input
                  type="text"
                  placeholder="e.g. Event Coordinator, Best Man, Sister, Self"
                  value={milestoneAssignedTo}
                  onChange={(e) => setMilestoneAssignedTo(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                />
              </div>

              <div>
                <label className="text-black">Scope Details & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Specific vendor deliverables, backup contingencies..."
                  value={milestoneDescription}
                  onChange={(e) => setMilestoneDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMilestoneModal(false)}
                  className="neo-btn px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn-primary px-5 py-2 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Run of Show Item */}
      {showAddRunOfShowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] animate-fade-in text-black">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h4 className="text-lg font-black text-black">Add Schedule Time Block</h4>
              <button
                onClick={() => setShowAddRunOfShowModal(false)}
                className="text-black hover:text-rose-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRunOfShow} className="mt-4 space-y-4 text-xs font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-black">Time / Hour</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 05:30 PM or 17:30"
                    value={runOfShowTime}
                    onChange={(e) => setRunOfShowTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  />
                </div>

                <div>
                  <label className="text-black">Activity / Cue</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grand Entrance & First Dance"
                    value={runOfShowActivity}
                    onChange={(e) => setRunOfShowActivity(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-black">Person In Charge</label>
                  <input
                    type="text"
                    placeholder="e.g. DJ / MC Dave"
                    value={runOfShowPerson}
                    onChange={(e) => setRunOfShowPerson(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  />
                </div>

                <div>
                  <label className="text-black">Location / Stage</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Ballroom Stage"
                    value={runOfShowLocation}
                    onChange={(e) => setRunOfShowLocation(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div>
                <label className="text-black">Technical Cue & Audio Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Spotlight on couple, cue track #4 at 20% volume"
                  value={runOfShowNotes}
                  onChange={(e) => setRunOfShowNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRunOfShowModal(false)}
                  className="neo-btn px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn-primary px-5 py-2 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
                >
                  Save Time Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
