"use client";

import React, { useState } from "react";
import {
  Palette,
  Gamepad2,
  Utensils,
  Mail,
  Music,
  Mic,
  Copy,
  Check,
} from "lucide-react";
import { EventPlan } from "@/types";

interface IdeasTabProps {
  event: EventPlan;
}

const getThemePicture = (themeName: string, eventType: string, idx: number) => {
  const lower = themeName.toLowerCase();
  if (lower.includes("rustic") || lower.includes("bohemian") || lower.includes("woodland")) {
    return "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80";
  }
  if (lower.includes("starry") || lower.includes("night") || lower.includes("celestial") || lower.includes("galaxy")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
  }
  if (lower.includes("neon") || lower.includes("glow") || lower.includes("cyber") || lower.includes("disco")) {
    return "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80";
  }
  if (lower.includes("vintage") || lower.includes("classic") || lower.includes("victorian") || lower.includes("retro")) {
    return "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80";
  }
  if (lower.includes("tropical") || lower.includes("beach") || lower.includes("sunset") || lower.includes("fiesta")) {
    return "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80";
  }
  if (lower.includes("garden") || lower.includes("floral") || lower.includes("botanical") || lower.includes("spring")) {
    return "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80";
  }
  const fallbacks = [
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80",
  ];
  return fallbacks[idx % fallbacks.length];
};

export const IdeasTab: React.FC<IdeasTabProps> = ({ event }) => {
  const [activeIdeaCategory, setActiveIdeaCategory] = useState<
    "themes" | "activities" | "menus" | "invitations" | "speeches" | "music"
  >("themes");
  const [copiedIndex, setCopiedIndex] = useState<number | string | null>(null);

  const handleCopy = (text: string, idx: number | string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const ideas = event.ideas;

  return (
    <div className="space-y-6 animate-fade-in text-black">
      {/* Category Pills Header in Neobrutalist Style */}
      <div className="flex flex-wrap items-center gap-2.5 pb-2">
        {[
          { id: "themes", label: "Aesthetic Themes", icon: Palette },
          { id: "activities", label: "Games & Icebreakers", icon: Gamepad2 },
          { id: "menus", label: "Menu Concepts", icon: Utensils },
          { id: "speeches", label: "Speeches & Toasts", icon: Mic },
          { id: "invitations", label: "Invitations & Wording", icon: Mail },
          { id: "music", label: "Curated Playlists", icon: Music },
        ].map((cat) => {
          const Icon = cat.icon;
          const isActive = activeIdeaCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveIdeaCategory(cat.id as any)}
              className={`flex items-center gap-2 rounded-xl border-2 border-black px-4 py-2 text-xs font-black transition-all shadow-[2.5px_2.5px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] ${
                isActive
                  ? "bg-[#eefc27] text-black"
                  : "bg-white text-black hover:bg-[#faf8f2]"
              }`}
            >
              <Icon className="h-4 w-4 text-black" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Themes & Styling */}
      {activeIdeaCategory === "themes" && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000]">
            <h4 className="text-lg font-black text-black">
              AI-Curated Aesthetic Concepts & Themes
            </h4>
            <p className="mt-1 text-xs font-medium text-slate-700">
              Personalized for your {event.eventType.replace("_", " ")} celebrating "{event.title}".
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {ideas.themes.map((theme, idx) => (
              <div
                key={idx}
                className="rounded-3xl border-2 border-black bg-white p-6 flex flex-col justify-between space-y-4 shadow-[5px_5px_0px_0px_#000]"
              >
                <div>
                  {/* External Illustration / Picture for Theme */}
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-4 border-2 border-black bg-[#faf8f2]">
                    <img
                      src={getThemePicture(theme.name, event.eventType, idx)}
                      alt={theme.name}
                      className="h-full w-full object-cover filter brightness-[0.85] hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="rounded-full bg-[#eefc27] border-2 border-black px-3 py-0.5 text-[11px] font-black text-black shadow-[1.5px_1.5px_0px_0px_#000]">
                        Concept #{idx + 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-black">
                      {theme.name}
                    </h3>
                    <span className="rounded-full border-1.5 border-black bg-[#fcd2c2] px-2.5 py-0.5 text-xs font-bold text-black shadow-[1px_1px_0px_0px_#000]">
                      {theme.vibes}
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-800 font-medium">
                    {theme.description}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-black text-black block mb-2">
                    Hex Color Harmony:
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {theme.colorPalette.map((color, cIdx) => (
                      <div
                        key={cIdx}
                        className="group relative flex items-center gap-1.5 rounded-xl border-1.5 border-black bg-[#faf8f2] p-1.5 pr-2.5 text-[11px] font-bold shadow-[1.5px_1.5px_0px_0px_#000]"
                      >
                        <div
                          className="h-5 w-5 rounded-lg border-1.5 border-black shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-mono text-black">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {theme.decorations && theme.decorations.length > 0 && (
                  <div className="pt-4 border-t-2 border-black">
                    <span className="text-xs font-black text-black block mb-2 flex items-center gap-1.5">
                      <Palette className="h-4 w-4 text-black" />
                      Required Decoration Items & Supplies:
                    </span>
                    <ul className="space-y-1.5 text-xs font-medium text-slate-800">
                      {theme.decorations.map((decor, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <span className="text-black font-black text-sm">•</span>
                          <span className="leading-relaxed">{decor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Activities & Icebreakers */}
      {activeIdeaCategory === "activities" && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000]">
            <h4 className="text-lg font-black text-black">
              Interactive Activities & Guest Icebreakers
            </h4>
            <p className="mt-1 text-xs font-medium text-slate-700">
              Designed to get guests mingling, laughing, and celebrating together.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ideas.activities.map((act, idx) => (
              <div
                key={idx}
                className="rounded-2xl border-2 border-black bg-white p-5 flex flex-col justify-between space-y-3 shadow-[4px_4px_0px_0px_#000]"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="rounded-full border-1.5 border-black bg-[#fcd2c2] px-2.5 py-0.5 font-black text-black shadow-[1px_1px_0px_0px_#000]">
                      {act.targetGroup}
                    </span>
                    <span className="rounded-full border-1.5 border-black bg-[#eefc27] px-2.5 py-0.5 font-black text-black shadow-[1px_1px_0px_0px_#000]">
                      ⏱ {act.duration}
                    </span>
                  </div>

                  <h4 className="mt-3 text-base font-black text-black">
                    {act.title}
                  </h4>

                  <p className="mt-2 text-xs font-medium text-slate-800 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Menus & Culinary */}
      {activeIdeaCategory === "menus" && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000]">
            <h4 className="text-lg font-black text-black">
              Catering & Gastronomy Inspiration
            </h4>
            <p className="mt-1 text-xs font-medium text-slate-700">
              Curated dining pairings with thoughtful dietary considerations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {ideas.menus.map((menu, idx) => (
              <div key={idx} className="rounded-2xl border-2 border-black bg-white p-6 space-y-4 shadow-[4px_4px_0px_0px_#000]">
                <h4 className="text-base font-black text-black flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-black" />
                  {menu.title}
                </h4>

                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-black">
                    Recommended Courses / Stations:
                  </span>
                  <ul className="space-y-2 text-xs font-medium text-slate-800">
                    {menu.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2">
                        <span className="text-black font-black">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t-2 border-black">
                  <span className="text-xs font-black text-black block mb-1.5">
                    Dietary Highlights Included:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {menu.dietaryHighlights.map((dh, dhIdx) => (
                      <span
                        key={dhIdx}
                        className="rounded-full border-1.5 border-black bg-[#c7f7d4] px-2.5 py-0.5 text-[10px] font-bold text-black shadow-[1px_1px_0px_0px_#000]"
                      >
                        ✓ {dh}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Invitations & Wording Templates */}
      {activeIdeaCategory === "invitations" && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000]">
            <h4 className="text-lg font-black text-black">
              Personalized Invitation Suites & Announcements
            </h4>
            <p className="mt-1 text-xs font-medium text-slate-700">
              One-click copyable announcement templates ready to email, text, or print.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {ideas.invitationTemplates.map((tpl, idx) => {
              const fullText = `${tpl.headline}\n\n${tpl.body}\n\n${tpl.rsvpDeadlineText}`;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border-2 border-black bg-white p-6 flex flex-col justify-between space-y-4 shadow-[4px_4px_0px_0px_#000]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border-1.5 border-black bg-[#c2e9fb] px-3 py-1 text-[11px] font-black text-black shadow-[1px_1px_0px_0px_#000]">
                        {tpl.style}
                      </span>
                      <button
                        onClick={() => handleCopy(fullText, idx)}
                        className="neo-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Template</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h5 className="text-base font-black text-black">
                      {tpl.headline}
                    </h5>

                    <p className="text-xs font-medium text-slate-900 leading-relaxed whitespace-pre-line bg-[#faf8f2] rounded-xl p-4 border-2 border-black font-serif italic shadow-[2px_2px_0px_0px_#000]">
                      "{tpl.body}"
                    </p>

                    <div className="text-xs text-black font-black">
                      📌 RSVP Notice: {tpl.rsvpDeadlineText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Speeches & Toasts */}
      {activeIdeaCategory === "speeches" && (() => {
        const defaultSpeeches = [
          {
            title: `Host Welcome & Opening Toast for ${event.title}`,
            role: "Host / Celebrant",
            speechText: `Good evening everyone! Thank you so much for being here at ${event.location || "this wonderful venue"} to celebrate ${event.title}. Having each of our ${event.guestCount} favorite people in this room means the absolute world to me. Tonight is all about great memories, wonderful conversations, and unforgettable celebrations. Let's raise our glasses to good times and cherished friends—cheers!`,
            deliveryTips: "Deliver with a warm smile right after welcome drinks are served. Keep it around 2 minutes."
          },
          {
            title: `Heartfelt Toast to the Guest of Honor`,
            role: "Best Friend / VIP Guest",
            speechText: `To our guest of honor: watching you reach this milestone is such an honor for all of us. You bring unmatched energy, kindness, and laughter everywhere you go. On behalf of everyone here at ${event.title}, we wish you the happiest year ahead, filled with health, big dreams, and pure joy. Cheers!`,
            deliveryTips: "Best given right before the cake cutting or keynote dinner segment. Raise your glass at the end."
          },
          {
            title: `Vote of Thanks & Cake Cutting Address`,
            role: "Celebrant / Host",
            speechText: `Before we cut the cake and hit the dance floor, I want to say a huge heartfelt thank you to everyone who helped bring ${event.title} together—especially our wonderful friends, family, and organizers. Your love and presence tonight made this day truly magical. Thank you all, and let's enjoy the rest of the night!`,
            deliveryTips: "Gather everyone around the cake table. Keep it sweet, punchy, and energetic."
          }
        ];
        const speechList = (ideas.speeches && ideas.speeches.length > 0) ? ideas.speeches : defaultSpeeches;

        return (
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000]">
              <h4 className="text-lg font-black text-black">
                Personalized Speeches & Keynote Toasts
              </h4>
              <p className="mt-1 text-xs font-medium text-slate-700">
                Ready-to-deliver speech scripts calibrated for your {event.eventType.replace("_", " ")} celebrating "{event.title}".
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {speechList.map((speech, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border-2 border-black bg-white p-6 flex flex-col justify-between space-y-4 shadow-[4px_4px_0px_0px_#000]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border-1.5 border-black bg-[#eefc27] px-3 py-1 text-[11px] font-black text-black shadow-[1px_1px_0px_0px_#000]">
                        {speech.role}
                      </span>
                      <button
                        onClick={() => handleCopy(speech.speechText, `speech-${idx}`)}
                        className="neo-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                      >
                        {copiedIndex === `speech-${idx}` ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Speech</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h5 className="text-base font-black text-black">
                      {speech.title}
                    </h5>

                    <p className="text-xs font-medium text-slate-900 leading-relaxed whitespace-pre-line bg-[#faf8f2] rounded-xl p-4 border-2 border-black font-serif italic shadow-[2px_2px_0px_0px_#000]">
                      "{speech.speechText}"
                    </p>

                    <div className="text-[11px] text-slate-800 font-bold bg-[#f1f5f9] rounded-lg p-2.5 border border-black">
                      🎤 <span className="font-black">Delivery Tips:</span> {speech.deliveryTips}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* 5. Playlists & Music */}
      {activeIdeaCategory === "music" && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000]">
            <h4 className="text-lg font-black text-black">
              Soundtrack & Music Playlists
            </h4>
            <p className="mt-1 text-xs font-medium text-slate-700">
              Vibe-tested playlists to set the exact atmospheric tone for your gathering.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {ideas.musicPlaylists.map((pl, idx) => (
              <div key={idx} className="rounded-2xl border-2 border-black bg-white p-6 space-y-4 shadow-[4px_4px_0px_0px_#000]">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-[#eefc27] shadow-[1.5px_1.5px_0px_0px_#000]">
                    <Music className="h-4 w-4 text-black" />
                  </div>
                  <h4 className="text-base font-black text-black">{pl.vibe}</h4>
                </div>

                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-black block mb-2">
                    Key Genres:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pl.recommendedGenres.map((g, gIdx) => (
                      <span
                        key={gIdx}
                        className="rounded-full border-1.5 border-black bg-[#fcd2c2] px-3 py-1 text-xs text-black font-bold shadow-[1px_1px_0px_0px_#000]"
                      >
                        🎵 {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-black">
                  <span className="text-xs font-black uppercase tracking-wider text-black block mb-2">
                    Song Highlights:
                  </span>
                  <ul className="space-y-1.5 text-xs font-medium text-slate-800">
                    {pl.songHighlights.map((song, sIdx) => (
                      <li key={sIdx} className="flex items-center gap-2">
                        <span className="text-black font-black">▶</span>
                        <span>{song}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
