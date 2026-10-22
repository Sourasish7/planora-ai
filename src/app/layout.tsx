import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Planora AI — GenAI-Powered Event Planning Assistant",
  description:
    "Intelligent event planning assistant for weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.",
  keywords: [
    "Event Planner",
    "GenAI",
    "Wedding Planning",
    "Birthday Planning",
    "Community Events",
    "Budget Allocator",
    "Run of Show",
    "Vendor Management",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#faf8f2] text-slate-900 selection:bg-[#eefc27] selection:text-black min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
