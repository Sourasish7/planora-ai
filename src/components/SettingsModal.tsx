"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  X,
  ShieldCheck,
  Key,
  Check,
  DollarSign,
  Cpu,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey?: string;
  aiProvider?: string;
  preferredCurrency?: string;
  onSaveSettings: (settings: {
    apiKey?: string;
    aiProvider: "auto" | "gemini" | "openai";
    preferredCurrency: string;
  }) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey: initialApiKey = "",
  aiProvider: initialProvider = "auto",
  preferredCurrency: initialCurrency = "USD",
  onSaveSettings,
}) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [aiProvider, setAiProvider] = useState<"auto" | "gemini" | "openai">(
    initialProvider as any
  );
  const [currency, setCurrency] = useState(initialCurrency);
  const [isSaved, setIsSaved] = useState(false);

  // ESC key listener to close modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings({
      apiKey: apiKey.trim(),
      aiProvider,
      preferredCurrency: currency,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg rounded-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000] text-black max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#eefc27] text-black shadow-[1.5px_1.5px_0px_0px_#000]">
              <Settings className="h-4 w-4 text-black" aria-hidden="true" />
            </div>
            <h3 id="modal-settings-title" className="text-base font-black text-black">
              Planora AI Settings & Security
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-white text-black hover:bg-[#fcd2c2] transition-colors shadow-[1.5px_1.5px_0px_0px_#000]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs font-bold text-black">
          {/* Security & Architecture Badge */}
          <div className="rounded-xl border-2 border-black bg-[#c7f7d4] p-3.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="flex items-center gap-2 text-black font-black mb-1">
              <ShieldCheck className="h-4 w-4 text-black" />
              <span>Strict Security & Local JSON Storage</span>
            </div>
            <p className="text-[11px] text-slate-800 leading-relaxed font-semibold">
              • Database: Stored locally in atomic JSON format (`data/planora-db.json`)<br />
              • Protection: Strict Zod validation schemas & XSS tag sanitization<br />
              • Rate Limiting: Token-bucket limiter protecting all endpoints<br />
              • Autonomous Capability: Built-in engine works 100% without external keys.
            </p>
          </div>

          {/* AI Engine Provider */}
          <div>
            <label className="text-black font-black block">
              GenAI Engine Provider
            </label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value as any)}
              className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
            >
              <option value="auto">
                Auto (Autonomous Knowledge Engine + Live Fallback) - Recommended
              </option>
              <option value="gemini">Google Gemini 1.5 Flash</option>
              <option value="openai">OpenAI GPT-4o-mini</option>
            </select>
            <p className="text-[10px] text-slate-600 mt-1 font-semibold">
              In "Auto" mode, Planora generates plans instantly even without an API key.
            </p>
          </div>

          {/* Optional API Key */}
          <div>
            <label className="text-black font-black flex items-center justify-between">
              <span>Live API Key (Optional)</span>
              <span className="text-[10px] text-slate-600 font-semibold">Gemini or OpenAI</span>
            </label>
            <div className="relative mt-1">
              <Key className="absolute left-3 top-3 h-3.5 w-3.5 text-black" />
              <input
                type="password"
                placeholder="AIzaSy... or sk-proj-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-xl border-2 border-black bg-[#faf8f2] py-2.5 pl-9 pr-3 text-black font-mono text-[11px] font-bold placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1 font-semibold">
              Never logged to public servers. Handled safely within your local environment.
            </p>
          </div>

          {/* Preferred Currency */}
          <div>
            <label className="text-black font-black block">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
            </select>
          </div>

          {/* Save CTA */}
          <div className="flex justify-end gap-2 pt-3 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn px-4 py-2 text-xs font-black shadow-[2px_2px_0px_0px_#000]"
            >
              Close
            </button>
            <button
              type="submit"
              className="neo-btn-primary px-5 py-2 text-xs font-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4 text-black" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
