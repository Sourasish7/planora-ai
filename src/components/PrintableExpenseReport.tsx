"use client";

import React from "react";
import {
  Printer,
  X,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { EventPlan } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface PrintableExpenseReportProps {
  event: EventPlan;
  onClose?: () => void;
  showActions?: boolean;
}

export const PrintableExpenseReport: React.FC<PrintableExpenseReportProps> = ({
  event,
  onClose,
  showActions = false,
}) => {
  const totalSpent = event.expenses.reduce(
    (sum, exp) => sum + (exp.paid ? exp.amount : 0),
    0
  );
  const pendingSpent = event.expenses.reduce(
    (sum, exp) => sum + (!exp.paid ? exp.amount : 0),
    0
  );
  const budget = event.totalBudget || 1;
  const remainingBudget = Math.max(0, event.totalBudget - totalSpent);
  const spentPct = Math.min(100, Math.round((totalSpent / budget) * 100));
  const isOverBudget = totalSpent > budget;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="printable-expense-report"
      className="space-y-6 text-black bg-white p-4 sm:p-6"
    >
      {/* Report Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-black gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-black">
              Planora<span className="text-black font-bold">.ai</span>
            </span>
            <span className="rounded-full bg-[#eefc27] border-2 border-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-[1.5px_1.5px_0px_0px_#000]">
              Official Expense Report
            </span>
          </div>
          <h1 id="expense-report-title" className="text-2xl font-black text-black mt-1">
            {event.title}
          </h1>
          <p className="text-xs font-bold text-slate-700 mt-0.5">
            Generated on {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Quick Actions (Hidden in Print) */}
        {showActions && (
          <div className="flex items-center gap-2 no-print self-end sm:self-center">
            <button
              onClick={handlePrint}
              className="neo-btn-primary flex items-center gap-2 px-4 py-2 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
            >
              <Printer className="h-4 w-4 text-black" />
              <span>Print Report</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close report"
                className="neo-btn p-2 shadow-[2px_2px_0px_0px_#000]"
              >
                <X className="h-5 w-5 text-black" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Event Context Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#faf8f2] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold">
        <div>
          <span className="text-slate-700 block text-[11px]">Event Type:</span>
          <span className="text-black capitalize">
            {event.eventType.replace("_", " ")}
          </span>
        </div>
        <div>
          <span className="text-slate-700 block text-[11px]">Target Date:</span>
          <span className="text-black">
            {event.date || "Date TBA"}
          </span>
        </div>
        <div>
          <span className="text-slate-700 block text-[11px]">Venue / Location:</span>
          <span className="text-black truncate block">
            {event.location || "Location TBA"}
          </span>
        </div>
        <div>
          <span className="text-slate-700 block text-[11px]">Guest Count:</span>
          <span className="text-black">
            {event.guestCount} Attendees
          </span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border-2 border-black bg-[#fcd2c2] shadow-[3px_3px_0px_0px_#000] space-y-1">
          <span className="text-[11px] font-black text-black">Total Budget</span>
          <p className="text-xl font-black text-black">
            {formatCurrency(event.totalBudget, event.currency)}
          </p>
          <span className="text-[10px] font-bold text-slate-800">Target limit</span>
        </div>

        <div className="p-4 rounded-2xl border-2 border-black bg-[#c7f7d4] shadow-[3px_3px_0px_0px_#000] space-y-1">
          <span className="text-[11px] font-black text-black">Total Spent</span>
          <p className="text-xl font-black text-black">
            {formatCurrency(totalSpent, event.currency)}
          </p>
          <span className="text-[10px] font-bold text-slate-800">{spentPct}% utilized</span>
        </div>

        <div className="p-4 rounded-2xl border-2 border-black bg-[#eefc27] shadow-[3px_3px_0px_0px_#000] space-y-1">
          <span className="text-[11px] font-black text-black">Remaining</span>
          <p
            className={`text-xl font-black ${
              isOverBudget ? "text-rose-600" : "text-black"
            }`}
          >
            {formatCurrency(remainingBudget, event.currency)}
          </p>
          <span className="text-[10px] font-bold text-slate-800">
            {isOverBudget ? "Over Budget Limit" : "Available funds"}
          </span>
        </div>

        <div className="p-4 rounded-2xl border-2 border-black bg-[#c2e9fb] shadow-[3px_3px_0px_0px_#000] space-y-1">
          <span className="text-[11px] font-black text-black">Pending</span>
          <p className="text-xl font-black text-black">
            {formatCurrency(pendingSpent, event.currency)}
          </p>
          <span className="text-[10px] font-bold text-slate-800">Unsettled quotes</span>
        </div>
      </div>

      {/* Category Budget Allocations */}
      <div>
        <h3 className="text-base font-black text-black mb-2.5 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-black" />
          Category Budget Allocations
        </h3>
        <div className="rounded-2xl border-2 border-black overflow-hidden bg-white shadow-[3px_3px_0px_0px_#000]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-black bg-[#faf8f2] text-[11px] font-black uppercase tracking-wider text-black">
                <th className="p-3">Category</th>
                <th className="p-3">Allocated</th>
                <th className="p-3">Spent</th>
                <th className="p-3">Variance</th>
                <th className="p-3">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 font-bold">
              {event.budgetAllocations.map((alloc) => {
                const variance = alloc.allocatedAmount - alloc.spentAmount;
                const catPct =
                  alloc.allocatedAmount > 0
                    ? Math.min(
                        100,
                        Math.round((alloc.spentAmount / alloc.allocatedAmount) * 100)
                      )
                    : 0;
                return (
                  <tr key={alloc.id} className="hover:bg-[#faf8f2]">
                    <td className="p-3 font-black text-black">
                      {alloc.category}
                      {alloc.notes && (
                        <span className="block text-[10px] font-medium text-slate-600">
                          {alloc.notes}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-black">
                      {formatCurrency(alloc.allocatedAmount, event.currency)}
                    </td>
                    <td className="p-3 text-black font-black">
                      {formatCurrency(alloc.spentAmount, event.currency)}
                    </td>
                    <td
                      className={`p-3 font-black ${
                        variance < 0 ? "text-rose-600" : "text-black"
                      }`}
                    >
                      {formatCurrency(variance, event.currency)}
                    </td>
                    <td className="p-3 text-black">{catPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Itemized Expenses Record */}
      <div>
        <h3 className="text-base font-black text-black mb-2.5 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-black" />
          Itemized Expenses Record
        </h3>
        <div className="rounded-2xl border-2 border-black overflow-hidden bg-white shadow-[3px_3px_0px_0px_#000]">
          {event.expenses.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-700 font-bold">
              No individual expenses recorded yet. Total budget is currently 100% available.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-black bg-[#faf8f2] text-[11px] font-black uppercase tracking-wider text-black">
                  <th className="p-3">Item / Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 font-bold">
                {event.expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#faf8f2]">
                    <td className="p-3">
                      <div className="font-black text-black">{exp.title}</div>
                      {exp.vendorId && (
                        <div className="text-[10px] text-slate-600 font-medium">
                          Vendor:{" "}
                          {event.vendors.find((v) => v.id === exp.vendorId)?.name ||
                            exp.vendorId}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="rounded-full border-1.5 border-black bg-[#faf8f2] px-2 py-0.5 text-[10px] font-bold text-black shadow-[1px_1px_0px_0px_#000]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">{exp.paidDate || "—"}</td>
                    <td className="p-3 text-slate-700">
                      {exp.paymentMethod || "Credit Card"}
                    </td>
                    <td className="p-3 font-black text-black">
                      {formatCurrency(exp.amount, event.currency)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border-1.5 border-black px-2.5 py-0.5 text-[10px] font-black shadow-[1px_1px_0px_0px_#000] ${
                          exp.paid
                            ? "bg-[#c7f7d4] text-black"
                            : "bg-[#eefc27] text-black"
                        }`}
                      >
                        {exp.paid ? "Paid" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
