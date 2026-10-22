"use client";

import React from "react";
import { createPortal } from "react-dom";
import { EventPlan } from "@/types";
import { PrintableExpenseReport } from "./PrintableExpenseReport";

interface ExpenseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventPlan;
}

export const ExpenseReportModal: React.FC<ExpenseReportModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-report-title"
      className="expense-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="expense-modal-card relative w-full max-w-4xl rounded-3xl bg-white border-2 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] animate-fade-in max-h-[92vh] overflow-y-auto text-black">
        <PrintableExpenseReport event={event} onClose={onClose} showActions />
      </div>
    </div>,
    document.body
  );
};

