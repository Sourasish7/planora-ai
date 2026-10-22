"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  MessageSquare,
  User,
  ArrowRight,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { EventPlan, ChatMessage } from "@/types";
import { ActiveTab } from "../TabNavigation";

interface AICopilotTabProps {
  event: EventPlan;
  onSendMessage: (message: string) => Promise<void>;
  onNavigateTab: (tab: ActiveTab) => void;
  isLoading: boolean;
}

export const AICopilotTab: React.FC<AICopilotTabProps> = ({
  event,
  onSendMessage,
  onNavigateTab,
  isLoading,
}) => {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [event.chatHistory, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput("");
    await onSendMessage(msg);
  };

  const handlePromptClick = async (prompt: string) => {
    if (isLoading) return;
    await onSendMessage(prompt);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case "OPEN_BUDGET_TAB":
      case "OPEN_ADD_EXPENSE_MODAL":
        onNavigateTab("budget");
        break;
      case "OPEN_TIMELINE_TAB":
        onNavigateTab("timeline");
        break;
      case "OPEN_VENDORS_TAB":
      case "OPEN_VENDOR_MODAL":
        onNavigateTab("vendors");
        break;
      case "OPEN_IDEAS_TAB":
        onNavigateTab("ideas");
        break;
      default:
        break;
    }
  };

  const renderFormattedMessage = (content: string) => {
    const lines = content.split("\n");

    const parseInline = (str: string) => {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
      let match;

      while ((match = regex.exec(str)) !== null) {
        if (match.index > lastIndex) {
          parts.push(str.substring(lastIndex, match.index));
        }
        if (match[2]) {
          // **bold**
          parts.push(
            <strong key={match.index} className="font-black text-black">
              {match[2]}
            </strong>
          );
        } else if (match[3]) {
          // *italic*
          parts.push(
            <em key={match.index} className="italic text-slate-800">
              {match[3]}
            </em>
          );
        } else if (match[4]) {
          // `code`
          parts.push(
            <code
              key={match.index}
              className="rounded border border-black bg-white px-1 py-0.5 font-mono text-xs text-black"
            >
              {match[4]}
            </code>
          );
        }
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < str.length) {
        parts.push(str.substring(lastIndex));
      }
      return parts.length > 0 ? parts : str;
    };

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      if (trimmed.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-black text-black text-sm mt-2 mb-1">
            {parseInline(trimmed.substring(4))}
          </h4>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h3 key={idx} className="font-black text-black text-base mt-2 mb-1">
            {parseInline(trimmed.substring(3))}
          </h3>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h2 key={idx} className="font-black text-black text-lg mt-3 mb-1">
            {parseInline(trimmed.substring(2))}
          </h2>
        );
      }

      // Bullet points
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
        const bulletText = trimmed.replace(/^[-*•]\s+/, "");
        return (
          <div key={idx} className="flex items-start gap-2 ml-2 my-0.5">
            <span className="text-black font-black leading-none mt-1">•</span>
            <div className="flex-1">{parseInline(bulletText)}</div>
          </div>
        );
      }

      // Numbered lists
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 ml-2 my-0.5">
            <span className="font-mono font-bold text-black min-w-[1.2rem]">
              {numMatch[1]}.
            </span>
            <div className="flex-1">{parseInline(numMatch[2])}</div>
          </div>
        );
      }

      return (
        <p key={idx} className="my-1">
          {parseInline(line)}
        </p>
      );
    });
  };

  return (
    <div
      role="region"
      aria-label="Planora AI Interactive Co-Pilot"
      className="flex flex-col h-[750px] border-2 border-black bg-white rounded-3xl overflow-hidden shadow-[5px_5px_0px_0px_#000] animate-fade-in text-black"
    >
      {/* Top Assistant Header */}
      <div className="flex items-center justify-between border-b-2 border-black bg-[#faf8f2] p-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-[#eefc27] shadow-[2px_2px_0px_0px_#000]">
            <Bot className="h-5 w-5 text-black" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-black">Planora Co-Pilot</h3>
              <span className="rounded-full border-1.5 border-black bg-[#c7f7d4] px-2.5 py-0.5 text-[10px] font-black text-black shadow-[1px_1px_0px_0px_#000]">
                Active Knowledge
              </span>
            </div>
            <p className="text-xs font-bold text-slate-700">
              Calibrated for: <span className="text-black font-black">{event.title}</span>
            </p>
          </div>
        </div>

        <div className="text-right text-xs font-bold text-slate-700 hidden sm:block">
          <span>AI Engine: Autonomous + Multi-LLM</span>
        </div>
      </div>

      {/* Suggested Quick Prompts Bar */}
      <div
        role="group"
        aria-label="Suggested Prompt Ideas"
        className="border-b-2 border-black bg-white px-4 py-2.5 overflow-x-auto scrollbar-none"
      >
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-black text-black flex items-center gap-1 whitespace-nowrap">
            <MessageSquare className="h-3.5 w-3.5 text-black" aria-hidden="true" /> Try asking:
          </span>
          {[
            "Where can I cut $1,000 from catering?",
            "Suggest 3 interactive games for our guests",
            "Draft a funny 2-minute welcome toast",
            "Emergency kit checklist for the day-of coordinator",
            "Check vendor payment schedule advice",
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(prompt)}
              disabled={isLoading}
              className="whitespace-nowrap rounded-xl border-1.5 border-black bg-[#faf8f2] px-3 py-1 text-[11px] font-bold text-black shadow-[1.5px_1.5px_0px_0px_#000] hover:bg-[#eefc27] hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area with Live Region for Screen Readers */}
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Chat conversation history"
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#faf8f2]"
      >
        {event.chatHistory.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0 text-xs font-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] ${
                  isUser
                    ? "bg-black text-white"
                    : "bg-[#eefc27] text-black"
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 border-2 border-black shadow-[3px_3px_0px_0px_#000] ${
                  isUser
                    ? "bg-[#c2e9fb] text-black rounded-tr-none"
                    : "bg-white text-black rounded-tl-none"
                }`}
              >
                <div>{renderFormattedMessage(msg.content)}</div>

                {/* Suggested Action Buttons returned by AI */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t-2 border-black flex flex-wrap gap-2">
                    {msg.suggestedActions.map((act, actIdx) => (
                      <button
                        key={actIdx}
                        onClick={() => handleActionClick(act.action)}
                        className="neo-btn flex items-center gap-1.5 px-3 py-1 text-xs font-black shadow-[1.5px_1.5px_0px_0px_#000]"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}

                {!isUser && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="text-[10px] font-bold text-slate-700 hover:text-black flex items-center gap-1 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-[#eefc27] text-black flex-shrink-0 shadow-[1.5px_1.5px_0px_0px_#000]">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl border-2 border-black bg-white rounded-tl-none p-4 text-xs font-bold text-black flex items-center gap-2 shadow-[3px_3px_0px_0px_#000]">
              <Loader2 className="h-4 w-4 animate-spin text-black" />
              <span>Planora AI is analyzing your celebration blueprint...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t-2 border-black bg-white p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            aria-label="Message for Planora AI Co-Pilot"
            placeholder="Ask Planora to adjust budget, suggest games, draft speeches, or review vendors..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-xl border-2 border-black bg-[#faf8f2] px-4 py-2.5 text-xs sm:text-sm font-bold text-black placeholder-slate-500 focus:outline-none shadow-[2px_2px_0px_0px_#000] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message to Planora AI"
            className="neo-btn-primary h-11 w-11 p-0 shadow-[2px_2px_0px_0px_#000] disabled:opacity-50 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4 text-black" aria-hidden="true" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
