import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "AU$",
  };
  const sym = symbols[currency] || `${currency} `;
  return `${sym}${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function getEventTypeBadge(type: string): { label: string; color: string } {
  switch (type) {
    case "wedding":
      return { label: "Wedding", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" };
    case "birthday":
      return { label: "Birthday", color: "bg-sky-500/15 text-sky-300 border-sky-500/30" };
    case "community":
    case "community_event":
      return { label: "Community", color: "bg-teal-500/15 text-teal-300 border-teal-500/30" };
    case "anniversary":
      return { label: "Anniversary", color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" };
    default:
      return { label: "Event", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" };
  }
}
