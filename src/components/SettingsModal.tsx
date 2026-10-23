"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  X,
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
  aiModel?: string;
  preferredCurrency?: string;
  onSaveSettings: (settings: {
    apiKey?: string;
    aiProvider: "auto" | "gemini" | "openai";
    aiModel?: string;
    preferredCurrency: string;
  }) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey: initialApiKey = "",
  aiProvider: initialProvider = "auto",
  aiModel: initialModel = "",
  preferredCurrency: initialCurrency = "USD",
  onSaveSettings,
}) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [aiProvider, setAiProvider] = useState<"auto" | "gemini" | "openai">(
    initialProvider as any
  );
  const [aiModel, setAiModel] = useState(initialModel);
  const [currency, setCurrency] = useState(initialCurrency);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state when props change
  useEffect(() => {
    setApiKey(initialApiKey);
    setAiProvider(initialProvider as any);
    setAiModel(initialModel);
    setCurrency(initialCurrency);
  }, [initialApiKey, initialProvider, initialModel, initialCurrency, isOpen]);

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
      aiModel: aiModel.trim(),
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
          {/* AI Engine Provider */}
          <div>
            <label className="text-black font-black block">
              GenAI Engine Provider
            </label>
            <select
              value={aiProvider}
              onChange={(e) => {
                const val = e.target.value as "auto" | "gemini" | "openai";
                setAiProvider(val);
                if (val === "gemini" && (!aiModel || aiModel.startsWith("gpt-") || aiModel.startsWith("o1") || aiModel.startsWith("o3"))) {
                  setAiModel("gemini-3.8-flash");
                } else if (val === "openai" && (!aiModel || aiModel.startsWith("gemini-"))) {
                  setAiModel("gpt-4o-mini");
                }
              }}
              className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black font-bold focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
            >
              <option value="auto">
                Auto (Autonomous Knowledge Engine + Live Fallback) - Recommended
              </option>
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
            </select>
            <p className="text-[10px] text-slate-600 mt-1 font-semibold">
              {aiProvider === "auto"
                ? 'In "Auto" mode, Planora generates plans instantly even without an API key.'
                : `Select any ${aiProvider === "gemini" ? "Google Gemini" : "OpenAI"} model or enter custom model identifier.`}
            </p>
          </div>

          {/* Custom Model Input when Gemini or OpenAI is selected */}
          {aiProvider !== "auto" && (
            <div className="rounded-xl border-2 border-black bg-[#faf8f2] p-3 shadow-[1.5px_1.5px_0px_0px_#000] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-black font-black flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-black" />
                  <span>{aiProvider === "gemini" ? "Gemini Model Name / ID" : "OpenAI Model Name / ID"}</span>
                </label>
                <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
                  Any Model Allowed
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  list={`model-suggestions-${aiProvider}`}
                  placeholder={
                    aiProvider === "gemini"
                      ? "e.g. gemini-3.8-flash, gemini-flash-latest, gemini-pro-latest"
                      : "e.g. gpt-4o, gpt-4o-mini, o3-mini, o1"
                  }
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full rounded-lg border-2 border-black bg-white py-2 px-3 text-black font-mono text-[11px] font-bold placeholder-slate-400 focus:outline-none shadow-[1px_1px_0px_0px_#000]"
                />
                <datalist id={`model-suggestions-${aiProvider}`}>
                  {aiProvider === "gemini" ? (
                    <>
                      <option value="gemini-3.8-flash" />
                      <option value="gemini-flash-latest" />
                      <option value="gemini-pro-latest" />
                      <option value="gemini-2.5-pro" />
                      <option value="gemini-3.1-pro-preview" />
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o" />
                      <option value="gpt-4o-mini" />
                      <option value="o3-mini" />
                      <option value="o1" />
                      <option value="o1-mini" />
                      <option value="gpt-4-turbo" />
                      <option value="gpt-3.5-turbo" />
                    </>
                  )}
                </datalist>
              </div>

              {/* Quick-select pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold text-slate-500">Popular:</span>
                {(aiProvider === "gemini"
                  ? ["gemini-3.8-flash", "gemini-flash-latest", "gemini-pro-latest", "gemini-2.5-pro"]
                  : ["gpt-4o-mini", "gpt-4o", "o3-mini", "o1"]
                ).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAiModel(preset)}
                    className={`text-[10px] px-2 py-0.5 rounded border border-black font-mono font-bold transition-all ${
                      aiModel === preset
                        ? "bg-[#eefc27] text-black shadow-[1.5px_1.5px_0px_0px_#000]"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-600 font-semibold">
                Type any custom, latest, or fine-tuned model identifier. Defaults to {aiProvider === "gemini" ? "gemini-1.5-flash" : "gpt-4o-mini"} if blank.
              </p>
            </div>
          )}

          {/* Optional API Key */}
          <div>
            <label className="text-black font-black flex items-center justify-between">
              <span>Live API Key {aiProvider !== "auto" ? "(Required for Live API)" : "(Optional)"}</span>
              <span className="text-[10px] text-slate-600 font-semibold">
                {aiProvider === "gemini" ? "Google AI Studio" : aiProvider === "openai" ? "OpenAI Platform" : "Gemini or OpenAI"}
              </span>
            </label>
            <div className="relative mt-1">
              <Key className="absolute left-3 top-3 h-3.5 w-3.5 text-black" />
              <input
                type="password"
                placeholder={
                  aiProvider === "gemini"
                    ? "AIzaSy... (Gemini API Key)"
                    : aiProvider === "openai"
                    ? "sk-proj-... (OpenAI API Key)"
                    : "AIzaSy... or sk-proj-..."
                }
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
