"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  PieChart,
  Tag,
  Receipt,
  X,
} from "lucide-react";
import { EventPlan, BudgetItem, Expense } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BudgetTabProps {
  event: EventPlan;
  onAddBudgetItem: (item: Omit<BudgetItem, "id">) => Promise<void>;
  onUpdateBudgetItem: (itemId: string, updates: Partial<BudgetItem>) => Promise<void>;
  onDeleteBudgetItem: (itemId: string) => Promise<void>;
  onAddExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  onUpdateExpense: (expenseId: string, updates: Partial<Expense>) => Promise<void>;
  onDeleteExpense: (expenseId: string) => Promise<void>;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({
  event,
  onAddBudgetItem,
  onUpdateBudgetItem,
  onDeleteBudgetItem,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  const [filterPaid, setFilterPaid] = useState<"all" | "paid" | "pending">("all");
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // New Expense Form State
  const [newExpenseTitle, setNewExpenseTitle] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState(
    event.budgetAllocations[0]?.category || "General"
  );
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseVendor, setNewExpenseVendor] = useState("");
  const [newExpensePaid, setNewExpensePaid] = useState(false);
  const [newExpenseNotes, setNewExpenseNotes] = useState("");
  const [newExpenseMethod, setNewExpenseMethod] = useState("Credit Card");

  // New Category Form State
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryAllocated, setNewCategoryAllocated] = useState("");
  const [newCategoryNotes, setNewCategoryNotes] = useState("");

  const totalSpent = event.expenses.reduce(
    (sum, exp) => sum + (exp.paid ? exp.amount : 0),
    0
  );
  const totalAllocated = event.budgetAllocations.reduce(
    (sum, b) => sum + b.allocatedAmount,
    0
  );
  const remaining = event.totalBudget - totalSpent;
  const isOverBudget = totalSpent > event.totalBudget;

  const filteredExpenses = event.expenses.filter((exp) => {
    if (filterPaid === "paid") return exp.paid;
    if (filterPaid === "pending") return !exp.paid;
    return true;
  });

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle || !newExpenseAmount) return;

    await onAddExpense({
      title: newExpenseTitle.trim(),
      category: newExpenseCategory,
      amount: parseFloat(newExpenseAmount) || 0,
      paid: newExpensePaid,
      vendorId: newExpenseVendor.trim() || undefined,
      notes: newExpenseNotes.trim() || undefined,
      paymentMethod: newExpenseMethod,
      paidDate: new Date().toISOString().split("T")[0],
    });

    setNewExpenseTitle("");
    setNewExpenseAmount("");
    setNewExpenseVendor("");
    setNewExpenseNotes("");
    setNewExpensePaid(false);
    setShowAddExpenseModal(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || !newCategoryAllocated) return;

    await onAddBudgetItem({
      category: newCategoryName.trim(),
      allocatedAmount: parseFloat(newCategoryAllocated) || 0,
      spentAmount: 0,
      notes: newCategoryNotes.trim() || undefined,
    });

    setNewCategoryName("");
    setNewCategoryAllocated("");
    setNewCategoryNotes("");
    setShowAddCategoryModal(false);
  };

  return (
    <div className="space-y-8 animate-fade-in text-black">
      {/* Top Overview 4 Pastel Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Budget Target - Pastel Peach */}
        <div className="rounded-2xl border-2 border-black bg-[#fcd2c2] p-5 shadow-[4px_4px_0px_0px_#000]">
          <span className="text-xs font-black text-black">Total Budget Target</span>
          <div className="mt-2 text-2xl font-black text-black">
            {formatCurrency(event.totalBudget, event.currency)}
          </div>
          <p className="mt-1 text-xs font-bold text-slate-800">
            Per guest: {formatCurrency(event.totalBudget / (event.guestCount || 1), event.currency)}
          </p>
        </div>

        {/* Total Committed & Paid - Pastel Mint */}
        <div className="rounded-2xl border-2 border-black bg-[#c7f7d4] p-5 shadow-[4px_4px_0px_0px_#000]">
          <span className="text-xs font-black text-black">Total Committed & Paid</span>
          <div className="mt-2 text-2xl font-black text-black">
            {formatCurrency(totalSpent, event.currency)}
          </div>
          <p className="mt-1 text-xs font-bold text-slate-800">
            {event.expenses.filter((e) => e.paid).length} verified payments
          </p>
        </div>

        {/* Remaining Balance - Vibrant Yellow */}
        <div className="rounded-2xl border-2 border-black bg-[#eefc27] p-5 shadow-[4px_4px_0px_0px_#000]">
          <span className="text-xs font-black text-black">Remaining Balance</span>
          <div
            className={`mt-2 text-2xl font-black ${isOverBudget ? "text-rose-600" : "text-black"
              }`}
          >
            {formatCurrency(remaining, event.currency)}
          </div>
          <p className="mt-1 text-xs font-bold text-slate-800">
            {isOverBudget ? "⚠️ Exceeded Target" : "Available to allocate"}
          </p>
        </div>

        {/* Total Allocated Sum - Pastel Blue */}
        <div className="rounded-2xl border-2 border-black bg-[#c2e9fb] p-5 shadow-[4px_4px_0px_0px_#000]">
          <span className="text-xs font-black text-black">Total Allocated Sum</span>
          <div className="mt-2 text-2xl font-black text-black">
            {formatCurrency(totalAllocated, event.currency)}
          </div>
          <p className="mt-1 text-xs font-bold text-slate-800">
            Across {event.budgetAllocations.length} primary categories
          </p>
        </div>
      </div>

      {/* AI Budget Optimization Insights Banner */}
      <div className="rounded-3xl border-2 border-black bg-[#eefc27] p-6 shadow-[5px_5px_0px_0px_#000]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] text-black flex-shrink-0">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-black">
                Planora AI Budget Advisory
              </h4>
              <p className="mt-1 text-xs font-medium text-slate-800 max-w-2xl leading-relaxed">
                {isOverBudget
                  ? "Alert: Expenses have exceeded planned targets. Consider trimming contingency or opting for package bundling on decor & rentals."
                  : `Your budget is in strong health! ${(100 - (totalSpent / event.totalBudget) * 100).toFixed(0)}% remains unspent. Catering and venue account for the majority of committed funds.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="neo-btn flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000] flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Category Allocations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-black" />
            <h3 className="text-base font-black text-black">
              Category Allocation Breakdown
            </h3>
          </div>
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="neo-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_#000]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {event.budgetAllocations.map((cat) => {
            const spent = cat.spentAmount || 0;
            const pct =
              cat.allocatedAmount > 0
                ? Math.min(100, Math.round((spent / cat.allocatedAmount) * 100))
                : 0;
            const isCatOver = spent > cat.allocatedAmount;

            return (
              <div
                key={cat.id}
                className="rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-black text-base text-black">{cat.category}</h5>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">{cat.notes}</p>
                  </div>
                  <button
                    onClick={() => onDeleteBudgetItem(cat.id)}
                    className="text-slate-700 hover:text-rose-600 p-1"
                    title="Delete Category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-baseline justify-between text-xs font-black text-black">
                  <span>
                    Spent: {formatCurrency(spent, event.currency)}
                  </span>
                  <span className="text-slate-700 font-bold">
                    Cap: {formatCurrency(cat.allocatedAmount, event.currency)}
                  </span>
                </div>

                {/* Progress meter */}
                <div className="mt-2.5 h-3 w-full rounded-full border-2 border-black bg-[#faf8f2] overflow-hidden">
                  <div
                    className={`h-full border-r-2 border-black transition-all duration-300 ${isCatOver
                        ? "bg-rose-500"
                        : pct > 80
                          ? "bg-[#eefc27]"
                          : "bg-[#c7f7d4]"
                      }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>{pct}% utilized</span>
                  <span className={isCatOver ? "text-rose-600 font-black" : ""}>
                    {isCatOver
                      ? `Over by ${formatCurrency(spent - cat.allocatedAmount, event.currency)}`
                      : `${formatCurrency(cat.allocatedAmount - spent, event.currency)} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses Log Table */}
      <div className="rounded-3xl border-2 border-black bg-white p-6 sm:p-8 space-y-5 shadow-[5px_5px_0px_0px_#000]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b-2 border-black pb-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-black" />
            <h3 className="text-lg font-black text-black">
              Itemized Expenses ({event.expenses.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex rounded-xl border-2 border-black bg-[#faf8f2] p-1 text-xs">
              {(["all", "paid", "pending"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterPaid(filter)}
                  className={`rounded-lg px-3 py-1 font-black capitalize transition-all ${filterPaid === filter
                      ? "bg-[#eefc27] text-black border-1.5 border-black shadow-[1px_1px_0px_0px_#000]"
                      : "text-slate-700 hover:text-black"
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="neo-btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_#000]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-black text-black uppercase tracking-wider text-[11px] font-black">
                <th className="pb-3">Expense Item</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Payment Info</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-700 font-bold">
                    No expenses found in this filter. Click "+ Add Expense" to log one.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#faf8f2] transition-colors">
                    <td className="py-3 font-bold text-black">
                      <div>{exp.title}</div>
                      {exp.notes && (
                        <div className="text-[10px] text-slate-600 font-medium">{exp.notes}</div>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="rounded-full border-1.5 border-black bg-[#faf8f2] px-2.5 py-0.5 text-[11px] font-bold text-black shadow-[1px_1px_0px_0px_#000]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 font-black text-black">
                      {formatCurrency(exp.amount, event.currency)}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() =>
                          onUpdateExpense(exp.id, { paid: !exp.paid })
                        }
                        className={`flex items-center gap-1 rounded-full border-1.5 border-black px-2.5 py-0.5 text-[10px] font-black shadow-[1px_1px_0px_0px_#000] transition-all ${exp.paid
                            ? "bg-[#c7f7d4] text-black"
                            : "bg-[#eefc27] text-black"
                          }`}
                        title="Click to toggle Paid status"
                      >
                        {exp.paid ? (
                          <>
                            <CheckCircle className="h-3 w-3" /> Paid
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" /> Pending
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 text-slate-700 font-medium">
                      {exp.paymentMethod || "Credit Card"}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="text-slate-600 hover:text-rose-600 p-1"
                        title="Delete Expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Expense */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] animate-fade-in text-black">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h4 className="text-lg font-black text-black">Log Event Expense</h4>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-black hover:text-rose-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-4 text-xs font-bold">
              <div>
                <label className="text-black">Expense Item / Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Photographer Deposit / Sound System Rental"
                  value={newExpenseTitle}
                  onChange={(e) => setNewExpenseTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-black">Category</label>
                  <select
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  >
                    {event.budgetAllocations.map((b) => (
                      <option key={b.id} value={b.category}>
                        {b.category}
                      </option>
                    ))}
                    <option value="General">General / Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="text-black">Amount ({event.currency})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="e.g. 1500"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-black">Payment Status</label>
                  <div className="mt-1 flex items-center gap-4 py-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={newExpensePaid}
                        onChange={() => setNewExpensePaid(true)}
                        className="accent-black"
                      />
                      Paid
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={!newExpensePaid}
                        onChange={() => setNewExpensePaid(false)}
                        className="accent-black"
                      />
                      Pending
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-black">Payment Method</label>
                  <select
                    value={newExpenseMethod}
                    onChange={(e) => setNewExpenseMethod(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Wire Transfer">Wire Transfer</option>
                    <option value="Bank Direct">Bank Direct</option>
                    <option value="Cash">Cash</option>
                    <option value="Venmo / Zelle / UPI">Venmo / Zelle / UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-black">Notes / Invoice #</label>
                <input
                  type="text"
                  placeholder="e.g. Invoice #982, Non-refundable retainer"
                  value={newExpenseNotes}
                  onChange={(e) => setNewExpenseNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="neo-btn px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn-primary px-5 py-2 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Category */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000] animate-fade-in text-black">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h4 className="text-base font-black text-black">Add Budget Category</h4>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-black hover:text-rose-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="mt-4 space-y-4 text-xs font-bold">
              <div>
                <label className="text-black">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Transportation, Fireworks, Audio Visual"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                />
              </div>

              <div>
                <label className="text-black">Allocated Cap ({event.currency})</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="e.g. 2000"
                  value={newCategoryAllocated}
                  onChange={(e) => setNewCategoryAllocated(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                />
              </div>

              <div>
                <label className="text-black">Notes / Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Shuttles from hotel to reception"
                  value={newCategoryNotes}
                  onChange={(e) => setNewCategoryNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="neo-btn px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn-primary px-5 py-2 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
