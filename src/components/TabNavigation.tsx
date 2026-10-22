"use client";

import React, { useRef } from "react";
import {
  LayoutDashboard,
  DollarSign,
  CalendarClock,
  Briefcase,
  Lightbulb,
  Bot,
} from "lucide-react";

export type ActiveTab =
  | "overview"
  | "budget"
  | "timeline"
  | "vendors"
  | "ideas"
  | "ai";

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  vendorCount: number;
  guestCount?: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  vendorCount,
}) => {
  const tabs = [
    {
      id: "overview" as ActiveTab,
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "budget" as ActiveTab,
      label: "Budgets & Expenses",
      icon: DollarSign,
    },
    {
      id: "timeline" as ActiveTab,
      label: "Timelines & Run of Show",
      icon: CalendarClock,
    },
    {
      id: "vendors" as ActiveTab,
      label: "Vendor Checklists",
      icon: Briefcase,
      badge: vendorCount > 0 ? vendorCount : undefined,
    },
    {
      id: "ideas" as ActiveTab,
      label: "Personalized Ideas",
      icon: Lightbulb,
    },
    {
      id: "ai" as ActiveTab,
      label: "Planora AI Assistant",
      icon: Bot,
      highlight: true,
    },
  ];

  const tabListRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation across tabs: ArrowRight & ArrowLeft
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== -1) {
      e.preventDefault();
      onTabChange(tabs[nextIndex].id);
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[nextIndex]?.focus();
    }
  };

  return (
    <nav
      role="tablist"
      aria-label="Event Planning Modules"
      ref={tabListRef}
      className="w-full pb-2"
    >
      <div className="flex space-x-1.5 overflow-x-auto p-2 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] scrollbar-none sm:space-x-2">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`group flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
                isActive
                  ? tab.highlight
                    ? "bg-[#eefc27] text-black border-2 border-black shadow-[2.5px_2.5px_0px_0px_#000]"
                    : "bg-[#eefc27] text-black border-2 border-black shadow-[2.5px_2.5px_0px_0px_#000]"
                  : "bg-transparent text-black border-2 border-transparent hover:border-black hover:bg-[#faf8f2] hover:shadow-[1.5px_1.5px_0px_0px_#000]"
              }`}
            >
              <Icon
                className="h-4 w-4 text-black transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
              <span>{tab.label}</span>

              {tab.badge !== undefined && (
                <span
                  className="rounded-full border-1.5 border-black bg-white px-2 py-0.5 text-[10px] font-black text-black shadow-[1px_1px_0px_0px_#000]"
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
