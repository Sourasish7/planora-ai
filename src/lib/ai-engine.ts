import type {
  GenerateEventPlanInput,
  EventPlan,
  BudgetItem,
  Milestone,
  RunOfShowItem,
  Vendor,
  EventIdeas,
  Guest,
  ChatMessage,
  EventType,
  SpeechIdea,
} from "@/types";

interface LLMResponse {
  content: string;
  planData?: Partial<EventPlan>;
  suggestedActions?: { label: string; action: string; payload?: Record<string, unknown> }[];
}

// Category allocation profiles by event type
const BUDGET_PROFILES: Record<EventType, { category: string; pct: number; notes: string }[]> = {
  wedding: [
    { category: "Venue & Rentals", pct: 32, notes: "Ceremony & banquet space, chairs, tables" },
    { category: "Catering & Bar", pct: 30, notes: "Dinner, hors d'oeuvres, signature bar & toast" },
    { category: "Photography & Videography", pct: 12, notes: "Full day coverage, drone, album & teaser" },
    { category: "Decor & Floral Design", pct: 10, notes: "Arbor floral, centerpieces, lighting" },
    { category: "Entertainment & Music", pct: 8, notes: "Live band / DJ, sound equipment" },
    { category: "Stationery & Favors", pct: 3, notes: "Invitations, programs, guest favors" },
    { category: "Contingency & Reserves", pct: 5, notes: "Buffer for unexpected logistics & gratuities" },
  ],
  birthday: [
    { category: "Venue Rental", pct: 35, notes: "Party room, rooftop or venue booking" },
    { category: "Food & Finger Bites", pct: 25, notes: "Buffet or passed appetizers" },
    { category: "Cake & Custom Sweets", pct: 10, notes: "Showstopper tiered or themed cake" },
    { category: "Drinks & Mocktails/Cocktails", pct: 12, notes: "Beverage bar and mixes" },
    { category: "Decor & Photobooth", pct: 10, notes: "Balloons, backdrop, lighting props" },
    { category: "Entertainment & Games", pct: 8, notes: "DJ, performer or party games" },
  ],
  anniversary: [
    { category: "Venue & Private Dining", pct: 38, notes: "Intimate hall or private dining room" },
    { category: "Gourmet Catering & Wine", pct: 32, notes: "Multi-course meal and champagne toast" },
    { category: "Photography & Memory Video", pct: 12, notes: "Couple portraits & memory showcase" },
    { category: "Floral & Atmosphere Styling", pct: 10, notes: "Ambient candles, roses, centerpieces" },
    { category: "Music & Acoustic Performer", pct: 8, notes: "Violinist, pianist, or jazz singer" },
  ],
  college_festival: [
    { category: "Main Stage & Artist Headliner", pct: 35, notes: "Celebrity performer, DJ or band fees" },
    { category: "Sound, Stage & Lighting (AV)", pct: 25, notes: "Truss, LED wall, professional line-array sound" },
    { category: "Marketing, Banners & Merch", pct: 15, notes: "Wristbands, posters, social PR, student tees" },
    { category: "Prizes & Competition Awards", pct: 10, notes: "Hackathon / talent trophies & cash prize pools" },
    { category: "Security, Permits & Sanitization", pct: 10, notes: "Campus security, barricades, cleanup staff" },
    { category: "Volunteer Refreshments & Logistics", pct: 5, notes: "Food boxes, walkie-talkies, badges" },
  ],
  community_event: [
    { category: "Permits, Security & City Fees", pct: 25, notes: "Park license, insurance, sanitation stations" },
    { category: "Tents, Stages & Furniture", pct: 25, notes: "Canopies for stalls, folding chairs, small stage" },
    { category: "Sound & Audio Setup", pct: 15, notes: "Microphones, PA system for announcements & acts" },
    { category: "Community Activities & Workshops", pct: 15, notes: "Craft materials, kids games, raffle prizes" },
    { category: "Flyers, Signs & Promotion", pct: 10, notes: "Directional signs, social media, neighborhood flyers" },
    { category: "Emergency Reserve", pct: 10, notes: "Inclement weather backup & extra supplies" },
  ],
  corporate_social: [
    { category: "Venue & Presentation Hall", pct: 35, notes: "Conference hall or upscale lounge" },
    { category: "Catering & Networking Bar", pct: 35, notes: "High-end cocktail food and premium drinks" },
    { category: "AV & Keynote Production", pct: 15, notes: "Projectors, stage mics, recording setup" },
    { category: "Branded Swag & Welcome Kits", pct: 10, notes: "Custom gift bags and materials" },
    { category: "Staffing & Host Services", pct: 5, notes: "Registration attendants and greeters" },
  ],
  baby_shower: [
    { category: "Venue / Garden Space", pct: 30, notes: "Tea room, garden patio or home setup" },
    { category: "Brunch / Afternoon Tea Catering", pct: 35, notes: "Pastries, mocktails, finger sandwiches" },
    { category: "Dessert Table & Custom Cake", pct: 15, notes: "Macaron tower, cake pops, celebration cake" },
    { category: "Floral Arches & Balloon Garland", pct: 12, notes: "Pastel balloon arch and photo backdrop" },
    { category: "Games & Keepsake Favors", pct: 8, notes: "Baby trivia cards, advice book, scented favors" },
  ],
  cultural_gathering: [
    { category: "Venue & Community Hall", pct: 30, notes: "Large hall with open seating" },
    { category: "Traditional Feast & Sweets", pct: 35, notes: "Authentic multi-dish banquet" },
    { category: "Traditional Decor & Lighting", pct: 15, notes: "Drapes, floral garlands, cultural symbols" },
    { category: "Performers & Cultural Artists", pct: 12, notes: "Folk dancers, musicians, ceremonial items" },
    { category: "Logistics & Volunteer Support", pct: 8, notes: "Audio, registration, cleanup" },
  ],
  custom: [
    { category: "Primary Venue", pct: 35, notes: "Main event location" },
    { category: "Food & Refreshments", pct: 30, notes: "Catering and beverage service" },
    { category: "Atmosphere & Decor", pct: 15, notes: "Aesthetic styling and setup" },
    { category: "Entertainment & Programming", pct: 12, notes: "Activities, audio, entertainment" },
    { category: "Contingency Fund", pct: 8, notes: "Discretionary buffer" },
  ],
};

export type BudgetTier = "pocket" | "micro" | "budget" | "moderate" | "premium";

/**
 * Calculates budget tier according to currency and purchasing power
 * e.g. 100 INR is ~$1.18 USD (pocket tier), whereas 100 USD is $100 USD (budget tier)
 */
export function getBudgetTier(budget: number, currency: string = "USD"): BudgetTier {
  const cur = (currency || "USD").toUpperCase();
  let usd = budget;
  if (cur === "INR") {
    usd = budget / 85;
  } else if (cur === "EUR") {
    usd = budget * 1.08;
  } else if (cur === "GBP") {
    usd = budget * 1.3;
  } else if (cur === "CAD" || cur === "AUD") {
    usd = budget * 0.72;
  }

  if (usd < 5) return "pocket";      // e.g. < ₹400 INR or < $5 USD (ultra-low pocket e.g. 100rs, 200rs)
  if (usd < 35) return "micro";      // e.g. ₹400 - ₹3,000 INR or $5 - $35 USD (e.g. 500rs, 1000rs)
  if (usd < 180) return "budget";    // e.g. ₹3,000 - ₹15,000 INR or $35 - $180 USD (e.g. 100$)
  if (usd < 900) return "moderate";  // e.g. ₹15,000 - ₹75,000 INR or $180 - $900 USD
  return "premium";                  // e.g. > ₹75,000 INR or > $900 USD
}

export function getEstimatedSupplyCost(itemName: string, currency: string = "USD"): { amount: number; formatted: string } {
  const cur = (currency || "USD").toUpperCase();
  const baseMapINR: Record<string, number> = {
    Balloons: 30,
    Candles: 20,
    Cake: 350,
    "Wedding Cake": 1200,
    "Birthday Banner": 60,
    Banner: 50,
    "Party Poppers": 50,
    "Party Hats": 40,
    "Fairy Lights": 120,
    Streamers: 30,
    Flowers: 150,
    "Welcome Sign": 200,
    Ribbons: 30,
    "Table Runner": 120,
    "Photo Props": 100,
    "Paper Plates & Cups": 60,
  };

  const inrAmount = baseMapINR[itemName] || 40;
  if (cur === "INR") {
    return { amount: inrAmount, formatted: `₹${inrAmount}` };
  }
  const usdAmount = Math.max(1, Math.round(inrAmount / 85));
  if (cur === "USD") {
    return { amount: usdAmount, formatted: `$${usdAmount}` };
  }
  return { amount: usdAmount, formatted: `${cur} ${usdAmount}` };
}

/**
 * Dynamically scales decoration items and supplies strictly according to the event's budget tier.
 * For example:
 * - 100 INR (~$1.18 USD): Pocket tier -> 2 affordable essentials (Balloons, Candles) costing ~₹50.
 * - 100 USD (~₹8,500 INR): Budget tier -> 8 celebration supplies (Balloons, Cake, Candles, Banner, Poppers, Hats, Fairy Lights, Streamers).
 */
export function getDecorationsForEvent(eventType: EventType, tier: BudgetTier = "budget"): string[] {
  const decorMap: Record<EventType, Record<BudgetTier, string[]>> = {
    birthday: {
      pocket: [
        "Balloons",
        "Candles",
      ],
      micro: [
        "Balloons",
        "Cake",
        "Candles",
        "Birthday Banner",
      ],
      budget: [
        "Balloons",
        "Cake",
        "Candles",
        "Birthday Banner",
        "Party Poppers",
        "Party Hats",
        "Fairy Lights",
        "Streamers",
      ],
      moderate: [
        "Balloons",
        "Cake",
        "Candles",
        "Birthday Banner",
        "Party Poppers",
        "Party Hats",
        "Fairy Lights",
        "Streamers",
        "Photo Props",
        "Flowers",
      ],
      premium: [
        "Balloons",
        "Cake",
        "Candles",
        "Birthday Banner",
        "Party Poppers",
        "Party Hats",
        "Fairy Lights",
        "Streamers",
        "Photo Props",
        "Flowers",
        "Table Runner",
        "Welcome Sign",
      ],
    },
    wedding: {
      pocket: [
        "Flowers",
        "Candles",
      ],
      micro: [
        "Flowers",
        "Wedding Cake",
        "Candles",
        "Fairy Lights",
      ],
      budget: [
        "Flowers",
        "Wedding Cake",
        "Candles",
        "Fairy Lights",
        "Balloons",
        "Welcome Sign",
        "Ribbons",
        "Table Runner",
      ],
      moderate: [
        "Flowers",
        "Wedding Cake",
        "Candles",
        "Fairy Lights",
        "Balloons",
        "Welcome Sign",
        "Ribbons",
        "Table Runner",
        "Photo Props",
        "Streamers",
      ],
      premium: [
        "Flowers",
        "Wedding Cake",
        "Candles",
        "Fairy Lights",
        "Welcome Sign",
        "Ribbons",
        "Table Runner",
        "Balloons",
        "Photo Props",
        "Streamers",
        "Party Poppers",
        "Paper Plates & Cups",
      ],
    },
    anniversary: {
      pocket: [
        "Balloons",
        "Candles",
      ],
      micro: [
        "Balloons",
        "Cake",
        "Candles",
        "Banner",
      ],
      budget: [
        "Balloons",
        "Cake",
        "Candles",
        "Banner",
        "Fairy Lights",
        "Flowers",
        "Table Runner",
        "Party Poppers",
      ],
      moderate: [
        "Balloons",
        "Cake",
        "Candles",
        "Banner",
        "Fairy Lights",
        "Flowers",
        "Table Runner",
        "Party Poppers",
        "Photo Props",
      ],
      premium: [
        "Balloons",
        "Cake",
        "Candles",
        "Banner",
        "Fairy Lights",
        "Flowers",
        "Table Runner",
        "Party Poppers",
        "Photo Props",
        "Welcome Sign",
      ],
    },
    community_event: {
      pocket: [
        "Banner",
        "Balloons",
      ],
      micro: [
        "Banner",
        "Fairy Lights",
        "Balloons",
        "Welcome Sign",
      ],
      budget: [
        "Banner",
        "Fairy Lights",
        "Balloons",
        "Welcome Sign",
        "Streamers",
        "Flowers",
        "Party Hats",
      ],
      moderate: [
        "Vinyl Welcome Arch",
        "Festoon Lights",
        "Directional Signs",
        "Stall Canopies",
        "Stage Backdrop",
        "Eco Bunting",
        "Wildflower Centerpieces",
        "Recycling Stations",
      ],
      premium: [
        "Grand Welcome Arch",
        "Festoon Lighting Rig",
        "Directional Signboards",
        "Artisan Tents",
        "Stage Backdrop",
        "Amphitheater Covers",
        "Planter Centerpieces",
        "Eco Stations",
      ],
    },
    college_festival: {
      pocket: [
        "Banner",
        "Balloons",
      ],
      micro: [
        "Banner",
        "Fairy Lights",
        "Balloons",
        "Welcome Sign",
      ],
      budget: [
        "Banner",
        "Fairy Lights",
        "Balloons",
        "Welcome Sign",
        "Streamers",
        "Party Poppers",
        "Photo Props",
      ],
      moderate: [
        "Truss Stage Rig",
        "Holographic Gate",
        "Laser Projectors",
        "Neon Pointers",
        "Crowd Wristbands",
        "Campus Festoon Lights",
        "Photo Booth",
        "Stage Scrim",
      ],
      premium: [
        "Giant LED Screen Backdrop",
        "Truss Lighting Rig",
        "Holographic Arches",
        "Laser Show Lights",
        "Crowd Glow Batons",
        "Campus Neon Signs",
        "Stage Scrim",
        "VIP Lounge Decor",
      ],
    },
    cultural_gathering: {
      pocket: [
        "Flowers",
        "Candles",
      ],
      micro: [
        "Flowers",
        "Candles",
        "Fairy Lights",
        "Welcome Sign",
      ],
      budget: [
        "Flowers",
        "Candles",
        "Fairy Lights",
        "Welcome Sign",
        "Ribbons",
        "Table Runner",
        "Streamers",
      ],
      moderate: [
        "Fresh Marigold Torans",
        "Ornate Brass Diyas",
        "Grand Rangoli",
        "Brocade Silk Drapes",
        "Brass Bells",
        "Urli Bowls",
        "Incense Burners",
        "Floor Cushions",
      ],
      premium: [
        "Grand Floral Torans",
        "Ornate Urli & Floating Diyas",
        "Royal Rangoli Art",
        "Rich Brocade Drapes",
        "Grand Brass Bells",
        "Carved Wood Mandap",
        "Silk Floor Seating",
        "Aromatic Floral Urli",
      ],
    },
    baby_shower: {
      pocket: [
        "Balloons",
        "Candles",
      ],
      micro: [
        "Balloons",
        "Cake",
        "Candles",
        "Banner",
      ],
      budget: [
        "Balloons",
        "Cake",
        "Candles",
        "Banner",
        "Fairy Lights",
        "Ribbons",
        "Flowers",
        "Photo Props",
      ],
      moderate: [
        "Balloons",
        "Cake",
        "Candles",
        "Banner",
        "Fairy Lights",
        "Ribbons",
        "Flowers",
        "Photo Props",
        "Table Runner",
        "Party Hats",
      ],
      premium: [
        "Balloons",
        "Cake",
        "Candles",
        "Banner",
        "Fairy Lights",
        "Ribbons",
        "Flowers",
        "Photo Props",
        "Table Runner",
        "Party Hats",
        "Welcome Sign",
        "Party Poppers",
      ],
    },
    corporate_social: {
      pocket: [
        "Banner",
        "Balloons",
      ],
      micro: [
        "Banner",
        "Fairy Lights",
        "Balloons",
        "Welcome Sign",
      ],
      budget: [
        "Banner",
        "Fairy Lights",
        "Balloons",
        "Welcome Sign",
        "Table Runner",
        "Flowers",
        "Photo Props",
      ],
      moderate: [
        "Banner",
        "Fairy Lights",
        "Balloons",
        "Welcome Sign",
        "Table Runner",
        "Flowers",
        "Photo Props",
        "Ribbons",
      ],
      premium: [
        "Banner",
        "Fairy Lights",
        "Balloons",
        "Welcome Sign",
        "Table Runner",
        "Flowers",
        "Photo Props",
        "Ribbons",
        "Party Poppers",
        "Paper Plates & Cups",
      ],
    },
    custom: {
      pocket: [
        "Balloons",
        "Candles",
      ],
      micro: [
        "Balloons",
        "Cake",
        "Candles",
        "Banner",
      ],
      budget: [
        "Balloons",
        "Cake",
        "Candles",
        "Banner",
        "Party Poppers",
        "Party Hats",
        "Fairy Lights",
        "Streamers",
      ],
      moderate: [
        "Balloons",
        "Cake",
        "Candles",
        "Banner",
        "Party Poppers",
        "Party Hats",
        "Fairy Lights",
        "Streamers",
        "Photo Props",
        "Flowers",
      ],
      premium: [
        "Balloons",
        "Cake",
        "Candles",
        "Banner",
        "Party Poppers",
        "Party Hats",
        "Fairy Lights",
        "Streamers",
        "Photo Props",
        "Flowers",
        "Table Runner",
        "Welcome Sign",
      ],
    },
  };

  const eventCategories = decorMap[eventType] || decorMap.custom;
  return eventCategories[tier] || eventCategories.budget;
}

// Generates an end-to-end plan using the internal AI rules
export function generateAutonomousPlan(input: GenerateEventPlanInput): Omit<EventPlan, "id" | "createdAt" | "updatedAt"> {
  const currency = input.currency || "USD";
  const budget = (typeof input.budget === "number" && !isNaN(input.budget) && input.budget >= 0) ? Math.round(input.budget) : 1000;
  const guestCount = (typeof input.guestCount === "number" && !isNaN(input.guestCount) && input.guestCount >= 1) ? Math.round(input.guestCount) : 10;
  const eventType = input.eventType || "custom";

  // 1. Budget Allocations
  const profile = BUDGET_PROFILES[eventType] || BUDGET_PROFILES.custom;
  const budgetAllocations: BudgetItem[] = profile.map((item, idx) => {
    const allocated = Math.round((budget * item.pct) / 100);
    return {
      id: `b-${idx + 1}`,
      category: item.category,
      allocatedAmount: allocated,
      spentAmount: 0,
      notes: `${item.notes} (${item.pct}% of total budget)`,
    };
  });

  // 2. Timeline Milestones
  const milestones: Milestone[] = getMilestonesForType(eventType, input.date);

  // 3. Day-of Run of Show
  const runOfShow: RunOfShowItem[] = getRunOfShowForType(eventType, input.title);

  // 4. Vendors Needed (tailored to location and budget)
  const vendors: Vendor[] = getVendorsForType(eventType, budgetAllocations, input.location);

  // 5. Personalized Ideas & Suggestions (dietary preferences, speeches, themes)
  const ideas: EventIdeas = getIdeasForType(eventType, input);

  // 6. Sample Initial Guests
  const sampleGuests: Guest[] = [
    { id: "g-1", name: "Guest of Honor / VIP 1", rsvpStatus: "attending", plusOnes: 1, dietary: "Standard", invitationSent: true },
    { id: "g-2", name: "Family Representative", rsvpStatus: "attending", plusOnes: 2, dietary: "Vegetarian", invitationSent: true },
    { id: "g-3", name: "Key Organizer / Coordinator", rsvpStatus: "attending", plusOnes: 0, dietary: "Gluten-Free", invitationSent: true },
  ];

  // 7. Initial Welcome Chat Message
  const chatHistory: ChatMessage[] = [
    {
      id: `c-init-${Date.now()}`,
      role: "assistant",
      content: `🎉 I have created your complete blueprint for "${input.title}"!\n\n• Budget: ${currency} ${budget.toLocaleString()} (${budgetAllocations.length} allocated categories)\n• Estimated Guests: ${guestCount}\n• Timeline: ${milestones.length} milestones & ${runOfShow.length} day-of schedule blocks\n• Vendors: ${vendors.length} curated vendor categories\n\nYou can chat with me below to customize any detail, reallocate budgets, add custom games, or generate invitations!`,
      timestamp: new Date().toISOString(),
      suggestedActions: [
        { label: "Add Vendor", action: "OPEN_VENDOR_MODAL" },
        { label: "Adjust Budget", action: "OPEN_BUDGET_TAB" },
        { label: "View Day-of Run of Show", action: "OPEN_TIMELINE_TAB" },
      ],
    },
  ];

  return {
    title: input.title,
    eventType: input.eventType,
    theme: ideas.themes[0]?.name || "Personalized Celebration Elegance",
    date: input.date || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    location: input.location || "City Centre Celebration Venue",
    guestCount,
    currency,
    totalBudget: budget,
    notes: input.specialRequests ? `Special notes: ${input.specialRequests}` : "Generated by Planora AI Assistant.",
    budgetAllocations,
    expenses: [],
    milestones,
    runOfShow,
    vendors,
    ideas,
    guests: sampleGuests,
    chatHistory,
  };
}

/**
 * Generate a FULL event plan using Gemini or OpenAI API.
 * The AI is given the user's inputs and asked to return a structured JSON plan.
 * Falls back to the hardcoded autonomous plan if no API key or on error.
 */
export async function generateAIPlan(
  input: GenerateEventPlanInput,
  apiKey?: string,
  provider: "auto" | "gemini" | "openai" = "auto",
  model?: string
): Promise<Omit<EventPlan, "id" | "createdAt" | "updatedAt">> {
  // If no API key, fall back to autonomous planner
  if (!apiKey) {
    return generateAutonomousPlan(input);
  }

  const currency = input.currency || "USD";
  const budget = (typeof input.budget === "number" && !isNaN(input.budget) && input.budget >= 0) ? Math.round(input.budget) : 1000;
  const guestCount = (typeof input.guestCount === "number" && !isNaN(input.guestCount) && input.guestCount >= 1) ? Math.round(input.guestCount) : 10;
  const tier = getBudgetTier(budget, currency);

  const planPrompt = `You are Planora AI, an expert event planner, financial advisor, and creative stylist.
The user wants to plan the following event. Generate a COMPLETE, PERSONALIZED plan.

EVENT DETAILS:
- Title: ${input.title}
- Type: ${input.eventType.replace("_", " ")}
- Budget: ${currency} ${budget.toLocaleString()} (${tier.toUpperCase()} TIER)
- Guest Count: ${guestCount}
- Date: ${input.date || "TBD (approximately 1 month from now)"}
- Location: ${input.location || "Not specified yet"}
- Style Preferences: ${input.stylePreferences || "None specified"}
- Special Requests: ${input.specialRequests || "None"}

Generate a COMPLETE event plan as JSON with this exact structure. Make EVERY field personalized and specific to this event — do NOT use generic placeholders. Allocate the budget realistically. Create creative, unique ideas tailored to the event type and preferences.

Return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "theme": "A creative, specific theme name for this event",
  "budgetAllocations": [
    { "category": "string", "allocatedAmount": number, "notes": "string" }
  ],
  "milestones": [
    { "timeframe": "string like '4 Weeks Before'", "title": "string", "description": "string" }
  ],
  "runOfShow": [
    { "time": "string like '06:00 PM'", "activity": "string", "personInCharge": "string", "location": "string" }
  ],
  "vendors": [
    { "name": "Specific vendor/company name suggestion", "category": "string", "status": "researching", "quotedPrice": number, "notes": "string" }
  ],
  "ideas": {
    "themes": [
      { "name": "string", "description": "string", "colorPalette": ["#hex","#hex","#hex","#hex"], "vibes": "string", "decorations": ["string","string","string"] }
    ],
    "activities": [
      { "title": "string", "targetGroup": "string", "description": "string", "duration": "string" }
    ],
    "menus": [
      { "title": "string", "items": ["string"], "dietaryHighlights": ["string"] }
    ],
    "invitationTemplates": [
      { "style": "string", "headline": "string", "body": "string", "rsvpDeadlineText": "string" }
    ],
    "musicPlaylists": [
      { "vibe": "string", "recommendedGenres": ["string"], "songHighlights": ["string"] }
    ]
  },
  "welcomeMessage": "A personalized welcome message for the event creator"
}

IMPORTANT RULES:
- Budget allocations MUST sum to approximately ${budget}
- CRITICAL FOR DECORATIONS ("decorations" list in ideas.themes):
  Calibrate decorations strictly to the budget of ${currency} ${budget.toLocaleString()} (${tier} tier) with ${guestCount} guests.
  You MUST include the essential, recognizable celebration supplies users expect:
  1. Balloons: "Colorful Latex Party Balloons (Pack of 20)" or themed balloon accents
  2. Cake: "Fresh Celebration Birthday Cake with Candles"
  3. Banner: "Happy Birthday Letter Wall Banner & Bunting"
  4. Party Poppers: "Celebration Party Poppers & Table Confetti"
  5. Party Hats: "Birthday Party Hats & Cone Caps (Pack of 5)"
  6. Fairy Lights: "Warm LED Fairy Lights for Wall Decor"
  7. Tableware: "Cake Cutting Knife & Paper Plates Set"
  8. Streamers: "Colorful Crepe Paper Streamers & Ribbons"
  NEVER propose awkward or verbose DIY phrases like "DIY Crepe Paper Streamers & Ribbon Backdrop", "Hand-Lettered Birthday Banner & Party Hats", "Cozy USB Fairy String Lights & Battery Tealights", "DIY Photo Corner with Fun Cardstock Selfie Props", or "Cake Table Confetti Sprinkles". Always prioritize clean, recognizable party essentials: Balloons, Birthday Cake with Candles, Banner, Poppers, Party Hats, and Fairy Lights.
- Generate at least 5 milestones, 6 run-of-show items, 4 vendors, 2 themes, 2 activities, 1 menu, 2 invitation templates, 2 playlists
- Make vendor names creative and realistic (not generic)
- All content must be personalized to "${input.title}" — NO generic content
- If special requests mention dietary preferences (e.g., "Veg Only"), reflect that in menus and catering vendors
- Return ONLY the JSON object, nothing else`;

  try {
    let aiResponseText: string;

    if (provider === "openai" || (!provider.includes("gemini") && apiKey.startsWith("sk-"))) {
      aiResponseText = await callOpenAIRaw(planPrompt, apiKey, model);
    } else {
      aiResponseText = await callGeminiRaw(planPrompt, apiKey, model);
    }

    // Parse AI-generated plan
    const cleanedJson = aiResponseText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    const aiPlan = JSON.parse(cleanedJson);

    // Build the full event plan from AI response, with safe defaults
    const budgetAllocations: BudgetItem[] = (aiPlan.budgetAllocations || []).map((item: any, idx: number) => ({
      id: `b-${idx + 1}`,
      category: item.category || `Category ${idx + 1}`,
      allocatedAmount: Math.round(item.allocatedAmount || 0),
      spentAmount: 0,
      notes: item.notes || "",
    }));

    const milestones: Milestone[] = (aiPlan.milestones || []).map((item: any, idx: number) => ({
      id: `m-${idx + 1}`,
      timeframe: item.timeframe || `Step ${idx + 1}`,
      title: item.title || `Milestone ${idx + 1}`,
      description: item.description || "",
      completed: idx === 0,
    }));

    const runOfShow: RunOfShowItem[] = (aiPlan.runOfShow || []).map((item: any, idx: number) => ({
      id: `ros-${idx + 1}`,
      time: item.time || `${6 + idx}:00 PM`,
      activity: item.activity || `Activity ${idx + 1}`,
      personInCharge: item.personInCharge || "TBD",
      location: item.location || "Main Area",
      status: "upcoming" as const,
    }));

    const vendors: Vendor[] = (aiPlan.vendors || []).map((item: any, idx: number) => ({
      id: `v-${idx + 1}`,
      name: item.name || `Vendor ${idx + 1}`,
      category: item.category || "General",
      status: (item.status || "researching") as Vendor["status"],
      quotedPrice: item.quotedPrice || 0,
      contractSigned: false,
      depositPaid: false,
      notes: item.notes || "",
    }));

    const fallbackIdeas = getIdeasForType(input.eventType || "custom", input);
    const parsedThemes = (aiPlan.ideas?.themes || []).map((t: any) => ({
      name: t.name || fallbackIdeas.themes[0]?.name || "Custom Theme",
      description: t.description || fallbackIdeas.themes[0]?.description || "",
      colorPalette: t.colorPalette || fallbackIdeas.themes[0]?.colorPalette || ["#FF007F", "#00F0FF", "#7B2CBF", "#FFE600"],
      vibes: t.vibes || fallbackIdeas.themes[0]?.vibes || "Cozy & Celebratory",
      decorations: (t.decorations && Array.isArray(t.decorations) && t.decorations.length > 0)
        ? t.decorations
        : getDecorationsForEvent(input.eventType || "custom", tier),
    }));

    const ideas: EventIdeas = {
      themes: parsedThemes.length > 0 ? parsedThemes : fallbackIdeas.themes,
      activities: (aiPlan.ideas?.activities || []).map((a: any) => ({
        title: a.title || "Activity",
        targetGroup: a.targetGroup || "All guests",
        description: a.description || "",
        duration: a.duration || "30 minutes",
      })),
      menus: (aiPlan.ideas?.menus || []).map((m: any) => ({
        title: m.title || "Menu",
        items: m.items || [],
        dietaryHighlights: m.dietaryHighlights || [],
      })),
      invitationTemplates: (aiPlan.ideas?.invitationTemplates || []).map((inv: any) => ({
        style: inv.style || "Modern",
        headline: inv.headline || "You're Invited!",
        body: inv.body || "",
        rsvpDeadlineText: inv.rsvpDeadlineText || "Please RSVP 2 weeks prior.",
      })),
      musicPlaylists: (aiPlan.ideas?.musicPlaylists || []).map((pl: any) => ({
        vibe: pl.vibe || "Feel-Good",
        recommendedGenres: pl.recommendedGenres || [],
        songHighlights: pl.songHighlights || [],
      })),
      speeches: (aiPlan.ideas?.speeches && aiPlan.ideas.speeches.length > 0)
        ? aiPlan.ideas.speeches.map((s: any) => ({
          title: s.title || "Keynote Toast",
          role: s.role || "Host",
          speechText: s.speechText || "",
          deliveryTips: s.deliveryTips || "Deliver with warmth.",
        }))
        : getIdeasForType(input.eventType || "custom", input).speeches,
    };

    const welcomeMsg = aiPlan.welcomeMessage ||
      `🎉 Your AI-powered plan for "${input.title}" is ready!`;

    const chatHistory: ChatMessage[] = [
      {
        id: `c-init-${Date.now()}`,
        role: "assistant",
        content: `🤖✨ **AI-Generated Plan Ready!**\n\n${welcomeMsg}\n\n• **Budget**: ${currency} ${budget.toLocaleString()} (${budgetAllocations.length} smart allocations)\n• **Guests**: ${guestCount} expected\n• **Timeline**: ${milestones.length} milestones & ${runOfShow.length} day-of blocks\n• **Vendors**: ${vendors.length} personalized vendor suggestions\n• **Theme**: ${aiPlan.theme || ideas.themes[0]?.name || "Custom"}\n\nEverything has been tailored to your event. Ask me to refine any detail!`,
        timestamp: new Date().toISOString(),
        suggestedActions: [
          { label: "Review Budget", action: "OPEN_BUDGET_TAB" },
          { label: "View Timeline", action: "OPEN_TIMELINE_TAB" },
          { label: "Explore Ideas", action: "OPEN_IDEAS_TAB" },
        ],
      },
    ];

    const sampleGuests: Guest[] = [
      { id: "g-1", name: "Guest of Honor / VIP 1", rsvpStatus: "attending", plusOnes: 1, dietary: "Standard", invitationSent: true },
      { id: "g-2", name: "Family Representative", rsvpStatus: "attending", plusOnes: 2, dietary: "Vegetarian", invitationSent: true },
      { id: "g-3", name: "Key Organizer / Coordinator", rsvpStatus: "attending", plusOnes: 0, dietary: "Gluten-Free", invitationSent: true },
    ];

    return {
      title: input.title,
      eventType: input.eventType,
      theme: aiPlan.theme || ideas.themes[0]?.name || "Personalized Celebration",
      date: input.date || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      location: input.location || "To Be Confirmed",
      guestCount,
      currency,
      totalBudget: budget,
      notes: input.specialRequests ? `Special notes: ${input.specialRequests}` : "AI-Generated Plan by Planora AI.",
      budgetAllocations,
      expenses: [],
      milestones,
      runOfShow,
      vendors,
      ideas,
      guests: sampleGuests,
      chatHistory,
    };
  } catch (err) {
    console.warn("[Planora AI] AI plan generation failed, falling back to autonomous engine:", err);
    return generateAutonomousPlan(input);
  }
}

/**
 * Automatically resolve and map Gemini model names to ensure active, working models
 */
export function resolveGeminiModel(modelName?: string): string {
  if (!modelName || !modelName.trim()) {
    return "gemini-3.8-flash";
  }
  const clean = modelName.trim().replace(/^models\//, "");
  const deprecatedMap: Record<string, string> = {
    "gemini-2.0-flash": "gemini-3.8-flash",
    "gemini-2.0-flash-lite": "gemini-3.8-flash",
    "gemini-2.5-flash": "gemini-3.8-flash",
    "gemini-1.5-flash": "gemini-3.8-flash",
    "gemini-1.5-pro": "gemini-3.1-pro-preview",
  };
  return deprecatedMap[clean] || clean;
}

/**
 * Raw Gemini API call — returns plain text response with multi-model fallback and timeout
 */
async function callGeminiRaw(prompt: string, apiKey: string, modelName?: string): Promise<string> {
  const primaryModel = resolveGeminiModel(modelName);
  const modelsToTry = [primaryModel, "gemini-flash-latest", "gemini-3.8-flash"].filter((m, idx, arr) => arr.indexOf(m) === idx);

  let lastError: Error | null = null;
  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 3072,
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        let errorDetail = res.statusText;
        try {
          const errorJson = await res.json();
          if (errorJson?.error?.message) errorDetail = errorJson.error.message;
        } catch { }
        throw new Error(`Gemini API error (${res.status}): ${errorDetail}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Planora AI] Gemini plan attempt with ${model} failed:`, err?.message || err);
    }
  }

  throw lastError || new Error("Failed to generate response from Gemini");
}

/**
 * Raw OpenAI API call — returns plain text response with timeout
 */
async function callOpenAIRaw(prompt: string, apiKey: string, modelName?: string): Promise<string> {
  const cleanModel = (modelName || "gpt-4o-mini").trim();
  const isReasoningModel = cleanModel.startsWith("o1") || cleanModel.startsWith("o3");

  const body: Record<string, unknown> = {
    model: cleanModel,
    messages: [
      { role: "system", content: "You are an expert event planner AI. Return only valid JSON." },
      { role: "user", content: prompt },
    ],
  };

  if (isReasoningModel) {
    body.max_completion_tokens = 4096;
  } else {
    body.temperature = 0.8;
    body.max_tokens = 4096;
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errorJson = await res.json();
      if (errorJson?.error?.message) errorDetail = errorJson.error.message;
    } catch { }
    throw new Error(`OpenAI API error (${res.status}): ${errorDetail}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function getMilestonesForType(eventType: EventType, targetDateStr?: string): Milestone[] {
  const baseMilestones: Record<EventType, { timeframe: string; title: string; description: string }[]> = {
    wedding: [
      { timeframe: "6 Months Before", title: "Select & Reserve Venue", description: "Tour spaces, review catering policies, lock in date with deposit." },
      { timeframe: "4 Months Before", title: "Book Core Vendors", description: "Contract photographer, videographer, florist, and live band/DJ." },
      { timeframe: "3 Months Before", title: "Order Attire & Taste Menu", description: "Schedule fittings and conduct tasting with executive chef." },
      { timeframe: "2 Months Before", title: "Dispatch Formal Invitations", description: "Send digital or printed invitations and activate online RSVP tracker." },
      { timeframe: "3 Weeks Before", title: "Finalize Seating Chart & Headcount", description: "Collate dietary restrictions and assign tables." },
      { timeframe: "1 Week Before", title: "Vendor Rehearsal & Logistics Confirmation", description: "Confirm load-in times, parking, and AV cues with venue manager." },
      { timeframe: "Day Before", title: "Rehearsal Walkthrough & Emergency Kit Prep", description: "Run of show rehearsal with wedding party and drop off decor." },
    ],
    birthday: [
      { timeframe: "4 Weeks Before", title: "Lock Down Venue & Theme", description: "Confirm location booking, theme color palette, and party playlist vibe." },
      { timeframe: "3 Weeks Before", title: "Send Invitations & Collect RSVPs", description: "Share party link with friends and monitor attendance." },
      { timeframe: "2 Weeks Before", title: "Order Custom Cake & Order Decor", description: "Finalize cake design, flavors, and order lighting/photo props." },
      { timeframe: "3 Days Before", title: "Confirm Music Playlist & Drink Supplies", description: "Download offline music set, purchase beverage mixers and ice." },
      { timeframe: "Day of Event", title: "Setup Decor, Sound Check & Ice Bar", description: "Inflate balloon garland, place welcome signage, test speakers." },
    ],
    anniversary: [
      { timeframe: "6 Weeks Before", title: "Select Intimate Venue & Date", description: "Book private dining room or scenic celebratory terrace." },
      { timeframe: "4 Weeks Before", title: "Curate Photo Slideshow & Speeches", description: "Collect memorable photos from family for video montage." },
      { timeframe: "2 Weeks Before", title: "Order Floral Centerpieces & Cake", description: "Confirm floral delivery and anniversary toast champagne." },
      { timeframe: "1 Week Before", title: "Confirm RSVP Headcount with Chef", description: "Confirm seating and special dietary plates." },
    ],
    college_festival: [
      { timeframe: "8 Weeks Before", title: "Admin Permissions & Artist Headliner Outreach", description: "Obtain campus dean approval, police NOC, and contact talent agencies." },
      { timeframe: "5 Weeks Before", title: "Sponsor Pitching & Technical Vendors", description: "Pitch corporate sponsors for stalls; contract stage, sound, and lighting vendors." },
      { timeframe: "3 Weeks Before", title: "Launch Campus Ticket Sales & Merch", description: "Open student registration portal, announce competition brackets." },
      { timeframe: "1 Week Before", title: "Volunteer Briefing & Security Walkthrough", description: "Train student coordinators, setup barricades and medical booth." },
      { timeframe: "Day Before", title: "Stage Construction & Sound Testing", description: "Assemble stage truss, LED screens, sound checks, artist green room setup." },
    ],
    community_event: [
      { timeframe: "6 Weeks Before", title: "Council Permits & Park Authorization", description: "Submit public gathering permits, waste management and sound license." },
      { timeframe: "4 Weeks Before", title: "Vendor & Stall Registration Open", description: "Invite local artisans, bakers, NGOs, and food truck operators." },
      { timeframe: "2 Weeks Before", title: "Neighborhood Promotion & Signage", description: "Place community flyers, announce on local forums and social pages." },
      { timeframe: "1 Week Before", title: "Volunteer Assignments & Schedule", description: "Assign shifts for setup, gate registration, and trash pickup." },
      { timeframe: "Day of Event", title: "Early Morning Canopies & Sound Check", description: "Setup tables, canopy tents, PA system, and info booth." },
    ],
    corporate_social: [
      { timeframe: "4 Weeks Before", title: "Venue Selection & AV Spec Confirmation", description: "Book hotel lounge or banquet hall with full presentation capability." },
      { timeframe: "3 Weeks Before", title: "Send Calendar Invites & Dietary Survey", description: "Notify team members and gather meal preferences." },
      { timeframe: "1 Week Before", title: "Print Name Badges & Awards Presentation", description: "Finalize award slides, trophies, and team recognition moments." },
      { timeframe: "Day of Event", title: "Stage & Tech Rehearsal", description: "Test microphones, clickers, music, and verify dinner layout." },
    ],
    baby_shower: [
      { timeframe: "4 Weeks Before", title: "Reserve Venue & Choose Theme", description: "Pick pastel/floral theme, book garden cafe or home space." },
      { timeframe: "3 Weeks Before", title: "Send Digital Invites & Registry Link", description: "Share gift registry and RSVP link with guests." },
      { timeframe: "1 Week Before", title: "Assemble Favors & Baby Games", description: "Print 'Who Knows Mommy Best' and 'Baby Bingo' cards." },
      { timeframe: "Day of Event", title: "Balloon Arch & Dessert Table Setup", description: "Arrange cake, pastries, and gifts display table." },
    ],
    cultural_gathering: [
      { timeframe: "6 Weeks Before", title: "Book Cultural Hall & Traditional Priests/Hosts", description: "Reserve banquet facility and coordinate ceremonial timings." },
      { timeframe: "4 Weeks Before", title: "Finalize Traditional Feast Menu", description: "Hire authentic caterer for festive dishes and sweets." },
      { timeframe: "2 Weeks Before", title: "Procure Traditional Decor & Pooja/Ritual Items", description: "Order fresh marigolds, festive lamps, and drape fabrics." },
      { timeframe: "Day of Event", title: "Floral Rangoli & Altar Setup", description: "Prepare ceremonial space, welcome drinks, and traditional music." },
    ],
    custom: [
      { timeframe: "4 Weeks Before", title: "Finalize Scope & Book Location", description: "Secure venue and set base budget." },
      { timeframe: "2 Weeks Before", title: "Confirm Refreshments & Entertainment", description: "Lock in caterer, sound, and supplies." },
      { timeframe: "1 Week Before", title: "Final Attendance Count & Checklist Review", description: "Follow up with pending RSVPs." },
      { timeframe: "Day of Event", title: "Execution & Stage Management", description: "Arrive 2 hours early to coordinate setup." },
    ],
  };

  const list = baseMilestones[eventType] || baseMilestones.custom;
  return list.map((item, idx) => ({
    id: `m-${idx + 1}`,
    timeframe: item.timeframe,
    title: item.title,
    description: item.description,
    completed: idx === 0, // mark first one completed for demonstration
  }));
}

function getRunOfShowForType(eventType: EventType, title: string): RunOfShowItem[] {
  const baseRunOfShow: Record<EventType, { time: string; activity: string; personInCharge: string; location: string }[]> = {
    wedding: [
      { time: "09:00 AM", activity: "Bridal Suite & Hair/Makeup Commencement", personInCharge: "Lead Stylist", location: "Dressing Suite" },
      { time: "11:30 AM", activity: "Floral & Decor Delivery / Chandelier Installation", personInCharge: "Florist Lead", location: "Main Hall" },
      { time: "01:30 PM", activity: "First Look Couple Portraits & Family Photos", personInCharge: "Lead Photographer", location: "Garden Courtyard" },
      { time: "03:30 PM", activity: "Guest Arrival & Welcome Refreshment Bar", personInCharge: "Maître D'", location: "Entrance Foyer" },
      { time: "04:00 PM", activity: "Ceremony Processional & Exchange of Vows", personInCharge: "Officiant", location: "Ceremony Pavilion" },
      { time: "05:00 PM", activity: "Cocktail Hour & Live Acoustic Music", personInCharge: "Catering Captain", location: "Terrace Lawn" },
      { time: "06:30 PM", activity: "Grand Entrance & Plated Banquet Dinner", personInCharge: "MC / Event Lead", location: "Grand Ballroom" },
      { time: "08:00 PM", activity: "Toasts, Speeches & Cake Cutting Ceremony", personInCharge: "Best Man & Maid of Honor", location: "Main Stage" },
      { time: "08:45 PM", activity: "First Dance & Open Dance Floor Extravaganza", personInCharge: "DJ / Live Band", location: "Dance Floor" },
      { time: "11:00 PM", activity: "Sparkler Grand Exit & Transportation Sendoff", personInCharge: "Coordinator", location: "Portico Gates" },
    ],
    birthday: [
      { time: "06:00 PM", activity: "Host Arrival, Sound Check & Balloon Setup", personInCharge: "Host & Decorator", location: "Party Space" },
      { time: "07:30 PM", activity: "Doors Open & Signature Welcome Cocktails", personInCharge: "Bartender", location: "Welcome Bar" },
      { time: "08:30 PM", activity: "Appetizers, Mingling & Photo Booth Fun", personInCharge: "Photographer", location: "Photo Station" },
      { time: "09:30 PM", activity: "Birthday Toast, Cake Cutting & Sing-along", personInCharge: "Host", location: "Center Stage" },
      { time: "10:00 PM", activity: "Dance Floor Party & Music Anthems", personInCharge: "DJ", location: "Dance Floor" },
      { time: "12:30 AM", activity: "Party Wind-Down & Favor Bags Handout", personInCharge: "Host", location: "Exit" },
    ],
    anniversary: [
      { time: "05:30 PM", activity: "Floral & Table Styling Setup", personInCharge: "Decorator", location: "Private Dining Suite" },
      { time: "06:30 PM", activity: "Champagne Welcome Reception", personInCharge: "Captain", location: "Lounge" },
      { time: "07:30 PM", activity: "Gourmet Dinner Service", personInCharge: "Executive Chef", location: "Main Dining Table" },
      { time: "08:45 PM", activity: "Photo Slideshow & Anniversary Toast", personInCharge: "Family Host", location: "Screening Area" },
      { time: "09:30 PM", activity: "Special Couple Slow Dance & Dessert", personInCharge: "Pianist", location: "Dining Suite" },
    ],
    college_festival: [
      { time: "08:00 AM", activity: "Campus Gates Open, Registration Desks Active", personInCharge: "Student Council", location: "Main Gate" },
      { time: "10:00 AM", activity: "Inaugural Ceremony & Lamp Lighting", personInCharge: "Principal & Chief Guest", location: "Auditorium" },
      { time: "11:30 AM", activity: "Inter-College Competitions (Dance, Debate, Coding)", personInCharge: "Club Leads", location: "Multiple Venues" },
      { time: "02:00 PM", activity: "Battle of the Bands Preliminaries", personInCharge: "Music Society", location: "Amphitheater" },
      { time: "05:30 PM", activity: "Prize Distribution & Sponsor Felicitation", personInCharge: "Dean of Student Affairs", location: "Main Ground Stage" },
      { time: "07:00 PM", activity: "Celebrity Headliner Artist Concert & DJ Night", personInCharge: "Festival Director", location: "Open Air Arena" },
      { time: "10:30 PM", activity: "Crowd Dispersal & Security Sweep", personInCharge: "Campus Security", location: "Entire Campus" },
    ],
    community_event: [
      { time: "07:00 AM", activity: "Stall Setup & Vendor Vehicles Check-in", personInCharge: "Logistics Lead", location: "Market Area" },
      { time: "09:00 AM", activity: "Official Gates Open to Public", personInCharge: "Volunteers", location: "Entrance" },
      { time: "10:30 AM", activity: "Kids Crafts & Face Painting Kiosk Opens", personInCharge: "Activity Coordinator", location: "Kids Zone" },
      { time: "12:00 PM", activity: "Local Band Live Performance", personInCharge: "Sound Tech", location: "Community Gazebo" },
      { time: "03:00 PM", activity: "Charity Raffle Draw & Announcements", personInCharge: "Community President", location: "Main Stage" },
      { time: "05:00 PM", activity: "Festival Closes, Eco-Clean Up Begins", personInCharge: "Green Team", location: "Park Lawn" },
    ],
    corporate_social: [
      { time: "04:30 PM", activity: "Registration, Lanyard Handout & Networking", personInCharge: "HR Team", location: "Foyer" },
      { time: "05:30 PM", activity: "Executive Welcome Address & Company Milestones", personInCharge: "CEO / VP", location: "Keynote Hall" },
      { time: "06:45 PM", activity: "Awards Ceremony & Recognition", personInCharge: "Host", location: "Keynote Hall" },
      { time: "07:30 PM", activity: "Dinner Buffet & Open Cocktail Bar", personInCharge: "Banquet Manager", location: "Dining Hall" },
      { time: "09:00 PM", activity: "Interactive Team Trivia & Entertainment", personInCharge: "MC", location: "Lounge" },
    ],
    baby_shower: [
      { time: "01:30 PM", activity: "Balloon Arch & Favor Bags Arrangement", personInCharge: "Host", location: "Tea Room" },
      { time: "02:30 PM", activity: "Guest Welcome, Mocktails & Finger Sandwiches", personInCharge: "Server", location: "Patio" },
      { time: "03:30 PM", activity: "Fun Baby Games & Advice Keepsake Book", personInCharge: "Maid of Honor", location: "Lounge" },
      { time: "04:30 PM", activity: "Gift Unwrapping & Cake Cutting", personInCharge: "Mom-to-Be", location: "Center Table" },
    ],
    cultural_gathering: [
      { time: "09:00 AM", activity: "Altar / Mandap Floral Decoration", personInCharge: "Family Elder", location: "Main Hall" },
      { time: "10:30 AM", activity: "Traditional Ritual & Welcoming of Guests", personInCharge: "Priest / MC", location: "Stage" },
      { time: "12:30 PM", activity: "Grand Festive Community Lunch", personInCharge: "Caterer", location: "Dining Area" },
      { time: "02:30 PM", activity: "Cultural Music & Dance Recital", personInCharge: "Art Troupe", location: "Auditorium" },
    ],
    custom: [
      { time: "09:00 AM", activity: "Venue Access & Setup", personInCharge: "Lead Organizer", location: "Main Area" },
      { time: "11:00 AM", activity: "Guest Welcome", personInCharge: "Greeter", location: "Entrance" },
      { time: "01:00 PM", activity: "Main Program & Food Service", personInCharge: "Lead Organizer", location: "Main Area" },
      { time: "04:00 PM", activity: "Wrap-up & Tear Down", personInCharge: "Cleanup Crew", location: "Main Area" },
    ],
  };

  const list = baseRunOfShow[eventType] || baseRunOfShow.custom;
  return list.map((item, idx) => ({
    id: `ros-${idx + 1}`,
    time: item.time,
    activity: item.activity,
    personInCharge: item.personInCharge,
    location: item.location,
    status: idx === 0 ? "upcoming" : "upcoming",
  }));
}

function getVendorsForType(eventType: EventType, allocations: BudgetItem[], location?: string): Vendor[] {
  const locPrefix = location && location.trim() ? `${location.split(",")[0].trim()} ` : "";

  const vendorProfiles: Record<string, { category: string; defaultVendor: string; status: Vendor["status"] }> = {
    "Venue & Rentals": { category: "Venue", defaultVendor: `${locPrefix}Grand Horizon Event Center`.trim(), status: "booked" },
    "Venue Rental": { category: "Venue", defaultVendor: `${locPrefix}Celebration Loft & Hall`.trim(), status: "booked" },
    "Permits, Security & City Fees": { category: "Government & Permits", defaultVendor: "City Municipal Event Desk", status: "booked" },
    "Catering & Bar": { category: "Catering", defaultVendor: `${locPrefix}Savor Artisan Kitchen & Bar`.trim(), status: "quote_received" },
    "Food & Finger Bites": { category: "Catering", defaultVendor: `${locPrefix}BiteCraft Catering Co.`.trim(), status: "quote_received" },
    "Cake & Custom Sweets": { category: "Bakery & Desserts", defaultVendor: `${locPrefix}Artisan Sweets & Cake Studio`.trim(), status: "booked" },
    "Drinks & Mocktails/Cocktails": { category: "Beverages & Bar", defaultVendor: `${locPrefix}PourCraft Signature Mocktail Bar`.trim(), status: "quote_received" },
    "Main Stage & Artist Headliner": { category: "Artist Agency", defaultVendor: "Apex Music Bookings", status: "shortlisted" },
    "Photography & Videography": { category: "Photography", defaultVendor: `${locPrefix}Aura Cinematic Photography`.trim(), status: "booked" },
    "Decor & Floral Design": { category: "Decor & Floral", defaultVendor: `${locPrefix}Petals & Velvet Event Styling`.trim(), status: "contacted" },
    "Decor & Photobooth": { category: "Decor & Photobooth", defaultVendor: `${locPrefix}GlowUp Photo Props & Backdrop Styling`.trim(), status: "contacted" },
    "Entertainment & Music": { category: "Music & DJ", defaultVendor: `${locPrefix}Sonic Wave DJ & Sound Hire`.trim(), status: "contacted" },
    "Entertainment & Games": { category: "Entertainment & Games", defaultVendor: `${locPrefix}FunZone Interactive Party Hosts`.trim(), status: "contacted" },
    "Sound, Stage & Lighting (AV)": { category: "Audio/Visual", defaultVendor: `${locPrefix}StageCraft Pro AV Rentals`.trim(), status: "booked" },
  };

  return allocations.slice(0, 5).map((alloc, idx) => {
    const profile = vendorProfiles[alloc.category] || {
      category: alloc.category,
      defaultVendor: `${locPrefix}${alloc.category} Specialists`.trim(),
      status: "contacted" as const,
    };
    return {
      id: `v-${idx + 1}`,
      name: profile.defaultVendor,
      category: profile.category,
      status: profile.status,
      quotedPrice: alloc.allocatedAmount,
      finalPrice: profile.status === "booked" ? alloc.allocatedAmount : undefined,
      contractSigned: profile.status === "booked",
      depositPaid: profile.status === "booked",
      notes: `Allocated from ${alloc.category}. Estimated quote: ${alloc.allocatedAmount}`,
    };
  });
}

function getIdeasForType(eventType: EventType, input?: GenerateEventPlanInput | string): EventIdeas {
  const inputObj = typeof input === "object" ? input : undefined;
  const budget = (typeof inputObj?.budget === "number" && !isNaN(inputObj.budget) && inputObj.budget >= 0)
    ? Math.round(inputObj.budget)
    : 5000;
  const currency = inputObj?.currency || "USD";
  const tier = getBudgetTier(budget, currency);
  const calibratedDecorations = getDecorationsForEvent(eventType, tier);

  const themeMap: Record<EventType, EventIdeas["themes"]> = {
    wedding: [
      {
        name: tier === "micro"
          ? "Intimate Heartfelt Gathering"
          : tier === "budget"
            ? "Charming Garden & Candlelight Romance"
            : "Opulent Rose Gold & Emerald Twilight",
        description: tier === "micro"
          ? "Cozy, romantic, budget-conscious celebration with handmade touches, warm fairy lights, and close friends."
          : tier === "budget"
            ? "Warm ambient candlelight, fairy light backdrops, and delicate floral accents tailored for close loved ones."
            : "Deep forest greens, soft blush roses, warm ambient candlelight, and geometric brass arches.",
        colorPalette: ["#1B4332", "#B76E79", "#D4AF37", "#F8F9FA"],
        vibes: tier === "micro" ? "Intimate, warm, heartfelt, charming" : "Timeless, luxury, romantic, enchanting",
        decorations: calibratedDecorations,
      },
      {
        name: tier === "micro"
          ? "Pastel Meadow Simplicity"
          : "Coastal Minimalist Riviera",
        description: tier === "micro"
          ? "Soft blush, warm ivory, hand-tied ribbon accents, and charming DIY paper florals."
          : "Breezy ivory linens, raw sandstone, olive branch sprigs, and gentle acoustic maritime tunes.",
        colorPalette: ["#023E8A", "#0077B6", "#E9D8A6", "#FFFFFF"],
        vibes: tier === "micro" ? "Delicate, sweet, sunlit, cozy" : "Effortless, chic, sun-drenched, serene",
        decorations: calibratedDecorations,
      },
    ],
    birthday: [
      {
        name: tier === "micro"
          ? "Cozy Friends & Streamers Bash"
          : tier === "budget"
            ? "Lively Festive Celebration & Balloon Arch"
            : "Electric Neon Arcade & Disco Retro",
        description: tier === "micro"
          ? "Vibrant, DIY-crafted party with colorful crepe streamers, warm fairy lights, Polaroid memories, and sweet celebrations."
          : tier === "budget"
            ? "Themed balloon garland kits, warm fairy light backdrop curtain, festive party poppers, and photo props."
            : "Vibrant ultraviolet lasers, magenta and cyan LED glow props, 80s synthesizer vibes and glitter.",
        colorPalette: ["#FF007F", "#00F0FF", "#7B2CBF", "#FFE600"],
        vibes: "High energy, nostalgic, thrilling, photogenic",
        decorations: calibratedDecorations,
      },
      {
        name: tier === "micro"
          ? "Retro Candlelight Lounge"
          : "Velvet Speakeasy & Golden Glamour",
        description: tier === "micro"
          ? "Warm ambient tealights, vinyl tunes, handmade cardstock bunting, and cozy party vibes."
          : "Moody vintage jazz club aesthetics, antique gold cocktail shakers, dim Edison bulbs, and velvet couches.",
        colorPalette: ["#1C1917", "#D97706", "#78350F", "#FAFAF9"],
        vibes: "Sophisticated, exclusive, jazzy, cozy",
        decorations: calibratedDecorations,
      },
    ],
    college_festival: [
      {
        name: tier === "micro"
          ? "Campus Indie Jam & Art Lawn"
          : "Cyber-Nexus: Future Tech & Bass Beats",
        description: tier === "micro"
          ? "Hand-painted directional signs, student artwork gallery, acoustic unplugged vibes, and fairy-lit lawn circles."
          : "Holographic accents, glowing circuit patterns, heavy EDM bass drops, and robotic LED installations.",
        colorPalette: ["#00F5D4", "#7B2CBF", "#F72585", "#0F172A"],
        vibes: "Futuristic, electrifying, youthful, explosive",
        decorations: calibratedDecorations,
      },
      {
        name: "Bohemian Sunset Carnival",
        description: "Dreamcatchers, acoustic lawns, indie art stalls, fairy lights across trees, and open-air jam circles.",
        colorPalette: ["#E76F51", "#F4A261", "#E9C46A", "#2A9D8F"],
        vibes: "Artistic, free-spirited, communal, melodic",
        decorations: calibratedDecorations,
      },
    ],
    community_event: [
      {
        name: tier === "micro"
          ? "Neighborhood Harmony & Eco Gathering"
          : "Harvest Harmony & Eco-Fair",
        description: tier === "micro"
          ? "Community-crafted eco fair with upcycled paper bunting, chalk art, mason jar lanterns, and acoustic lawn circles."
          : "Sustainable bamboo stalls, wildflower gardens, local acoustic folk artists, zero plastic waste.",
        colorPalette: ["#2D6A4F", "#52B788", "#D8F3DC", "#B7B7A4"],
        vibes: "Warm, inclusive, wholesome, uplifting",
        decorations: calibratedDecorations,
      },
    ],
    anniversary: [
      {
        name: tier === "micro"
          ? "Starlight Memories & Golden Glow"
          : "Golden Jubilee & Starlight Memories",
        description: tier === "micro"
          ? "Intimate celebration with milestone photos, glowing tealights, warm string lights, and heartfelt nostalgia."
          : "Brushed champagne gold, crystal chandeliers, archival memory photo wall, and vintage strings.",
        colorPalette: ["#D4AF37", "#FFF8DC", "#4A0E4E", "#111827"],
        vibes: "Regal, emotional, honoring, intimate",
        decorations: calibratedDecorations,
      },
    ],
    corporate_social: [
      {
        name: tier === "micro"
          ? "Creative Casual Meetup & Lounge"
          : "Metropolitan Skyline Gala",
        description: tier === "micro"
          ? "Clean modern paper styling, warm battery fairy lights, colorful balloon accents, and DIY photo moments."
          : "Clean architectural lines, sleek glass tableware, indigo uplighting, and modern lounge chillout.",
        colorPalette: ["#1E3A8A", "#3B82F6", "#94A3B8", "#0F172A"],
        vibes: "Polished, prestigious, inspiring, networking-friendly",
        decorations: calibratedDecorations,
      },
    ],
    baby_shower: [
      {
        name: tier === "micro"
          ? "Storybook Garden & Pastel Wishes"
          : "Storybook Garden & Pastel Dreams",
        description: tier === "micro"
          ? "Whimsical DIY pastel paper fans, cute baby clothesline bunting, warm fairy lights, and succulent accents."
          : "Whimsical floral arrangements, pastel mint and buttercup yellow bunting, and vintage children's books.",
        colorPalette: ["#A8DADC", "#F1FAEE", "#E63946", "#FFE3E0"],
        vibes: "Gentle, heartwarming, joyful, delicate",
        decorations: calibratedDecorations,
      },
    ],
    cultural_gathering: [
      {
        name: tier === "micro"
          ? "Festive Heritage & Traditional Diyas"
          : "Festive Heritage & Radiant Lamps",
        description: tier === "micro"
          ? "Fresh marigold flower torans, entrance floral rangoli, glowing clay diyas, and authentic festive warmth."
          : "Marigold yellow, auspicious vermilion red, traditional brass lamps, and fragrant sandalwood.",
        colorPalette: ["#DC2626", "#F59E0B", "#FBBF24", "#7F1D1D"],
        vibes: "Sacred, jubilant, traditional, bonding",
        decorations: calibratedDecorations,
      },
    ],
    custom: [
      {
        name: tier === "micro"
          ? "Intimate Handcrafted Celebration"
          : "Modern Contemporary Harmony",
        description: tier === "micro"
          ? "Cozy, charming setting with handmade paper bunting, warm fairy lights, and colorful party touches."
          : "Balanced neutral palette with vibrant pops of color tailored to the event vision.",
        colorPalette: ["#6366F1", "#EC4899", "#F3F4F6", "#111827"],
        vibes: "Clean, inviting, adaptable",
        decorations: calibratedDecorations,
      },
    ],
  };

  const activityMap: Record<EventType, EventIdeas["activities"]> = {
    wedding: [
      { title: "Vintage Audio Guestbook Telephone", targetGroup: "All Guests", description: "Guests lift the handset of a vintage rotary phone to record personal wishes and relationship wisdom.", duration: "Available all night" },
      { title: "Custom Cocktail Tasting & Pairing", targetGroup: "Adult Guests", description: "Bride & Groom signature cocktails served with miniature pairing bites.", duration: "Cocktail hour (60 min)" },
      { title: "The Couple Shoe Trivia Game", targetGroup: "Couple & Guests", description: "Hilarious lighthearted trivia where the couple raises shoes to answer 'Who does the cooking?' etc.", duration: "15 minutes" },
    ],
    birthday: [
      { title: "Smartphone Live Speed Trivia", targetGroup: "Party Guests", description: "Buzzer-style trivia quiz on big screen with custom rounds about the birthday person's life.", duration: "25 minutes" },
      { title: "Neon Glow Stick Dance Showdown", targetGroup: "All Attendees", description: "DJ triggers blacklight and guest teams battle in fun choreographed moves.", duration: "20 minutes" },
    ],
    college_festival: [
      { title: "Speed-Hack Battle / 60-Minute Prototype Challenge", targetGroup: "Students & Developers", description: "Teams of 3 build a creative GenAI prototype in 60 minutes with live judging.", duration: "60 minutes" },
      { title: "Open-Mic Standup & Acoustic Jam", targetGroup: "Student Performers", description: "Unplugged acoustic performances and 3-minute student comedy sets.", duration: "90 minutes" },
    ],
    community_event: [
      { title: "Neighborhood Scavenger Hunt", targetGroup: "Kids & Families", description: "Solve 8 clues hidden across park stalls to win eco-friendly seeds and tote bags.", duration: "2 hours" },
      { title: "Community Mural Handprint Art", targetGroup: "All Ages", description: "Collaborative canvas where every resident adds a painted leaf to a community tree mural.", duration: "All day" },
    ],
    anniversary: [
      { title: "Decade Memory Lane Quiz", targetGroup: "Family & Friends", description: "Fun retrospective quiz reviewing milestones, travels, and funny memories over the years.", duration: "20 minutes" },
    ],
    corporate_social: [
      { title: "Interactive Innovation Pitch Slam", targetGroup: "Team Members", description: "30-second rapid elevator pitches with humorous props and audience live voting.", duration: "30 minutes" },
    ],
    baby_shower: [
      { title: "Guess the Baby Due Date & Advice Jars", targetGroup: "Guests", description: "Guests write their top parenting survival tips and vote on birth statistics.", duration: "30 minutes" },
    ],
    cultural_gathering: [
      { title: "Folk Dance Circle & Community Singing", targetGroup: "All Generations", description: "Elders lead traditional circle dances that welcome newcomers of all skill levels.", duration: "45 minutes" },
    ],
    custom: [
      { title: "Interactive Icebreaker Challenge", targetGroup: "All Participants", description: "Engaging group icebreaker to spark conversations.", duration: "20 minutes" },
    ],
  };

  const menuMap: Record<EventType, EventIdeas["menus"]> = {
    wedding: [
      { title: "Artisan Plated Feast", items: ["Truffled Wild Mushroom Crostini", "Pan-Seared Salmon with Lemon Herb Butter OR Slow-Braised Short Ribs", "Herb Roasted Fingerling Potatoes & Grilled Asparagus", "Vanilla Bean Panna Cotta with Wild Berry Compote"], dietaryHighlights: ["Gluten-free alternatives", "Dedicated Vegan Option available", "Nut-free kitchen standard"] },
    ],
    birthday: [
      { title: "Gourmet Street Food & Slider Bar", items: ["Mini Angus Beef & Vegan Beyond Sliders", "Loaded Truffle Parmesan Fries", "Crispy Korean Fried Cauliflower Bites", "Custom Tiered Celebration Cake"], dietaryHighlights: ["Vegetarian & Dairy-Free options"] },
    ],
    college_festival: [
      { title: "Festival Street Food Pods", items: ["Gourmet Frankie Wraps & Burrito Bowls", "Artisan Wood-Fired Pizza Slices", "Loaded Nachos with Fresh Guacamole", "Cold Nitro Brew & Boba Tea"], dietaryHighlights: ["Halal, Vegan, and Jain options labeled clearly"] },
    ],
    community_event: [
      { title: "Farm-to-Table Community Grill", items: ["Locally Sourced Gourmet Sausages & Veggie Skewers", "Fresh Corn on the Cob with Cilantro Butter", "Watermelon Mint Salad", "Fresh Lemonades & Ciders"], dietaryHighlights: ["Kid-friendly and allergy conscious"] },
    ],
    anniversary: [
      { title: "Celebration 4-Course Degustation", items: ["Lobster Bisque / Heirloom Tomato Gazpacho", "Filet Mignon with Port Reduction", "Warm Molten Chocolate Fondant"], dietaryHighlights: ["Sommelier wine pairing"] },
    ],
    corporate_social: [
      { title: "Executive Networking Canapés", items: ["Smoked Salmon Blinis with Caviar", "Duck Confit Tartlets", "Vegan Stuffed Portobello Caps", "Artisan Cheese & Charcuterie"], dietaryHighlights: ["High protein, low carb and vegan tags"] },
    ],
    baby_shower: [
      { title: "Afternoon High Tea Tier", items: ["Cucumber & Herb Cream Cheese Sandwiches", "Warm Buttermilk Scones with Clotted Cream & Jam", "Sparkling Peach Bellini Mocktails"], dietaryHighlights: ["Caffeine-free herbal tea selections"] },
    ],
    cultural_gathering: [
      { title: "Traditional Festive Banquet", items: ["Fragrant Saffron Rice & Royal Curry", "Artisan Flatbreads & Crispy Savories", "Assorted Traditional Sweets & Cardamom Chai"], dietaryHighlights: ["100% Vegetarian options"] },
    ],
    custom: [
      { title: "Crowd Pleaser Buffet", items: ["Assorted Hot & Cold Platters", "Seasonal Salads", "Custom Dessert Bar"], dietaryHighlights: ["Dietary options accommodated"] },
    ],
  };

  const isVeg = Boolean(inputObj?.specialRequests && /veg|vegetarian|vegan|jain/i.test(inputObj.specialRequests));
  let finalMenus = menuMap[eventType] || menuMap.custom;

  if (isVeg) {
    finalMenus = [
      {
        title: "Royal Gourmet Pure Vegetarian Feast & Grazing Table",
        items: [
          "Royal Paneer Malai Tikka & Mint Chutney",
          "Truffled Wild Mushroom & Baby Spinach Sliders",
          "Crispy Golden Lotus Stem & Edamame Bites with Sweet Chilli",
          "Loaded Truffle Herb Fries with Plant-Based Garlic Aioli",
          "Custom Multi-Tiered Celebration Cake (100% Eggless)"
        ],
        dietaryHighlights: [
          "100% Pure Vegetarian & Plant-Based Friendly (per special request)",
          "Jain and Eggless Options Labeled Clearly"
        ]
      }
    ];
  }

  const hostName = inputObj?.title?.split(/\s+(?:birthday|wedding|anniversary|party|celebration|bash)/i)[0] || "The Host";
  const locationLabel = inputObj?.location || "this wonderful venue";
  const guestsLabel = inputObj?.guestCount ? `${inputObj.guestCount} guests` : "all our loved ones";
  const titleLabel = inputObj?.title || `${eventType.replace("_", " ")} celebration`;

  const speeches: SpeechIdea[] = [
    {
      title: `Host Welcome & Opening Toast for "${titleLabel}"`,
      role: "Host / Celebrant",
      speechText: `Good evening everyone! Thank you so much for being here at ${locationLabel} to celebrate ${titleLabel}. Having each of our ${guestsLabel} gathered in this room means the absolute world to me. Tonight is all about great memories, wonderful conversations, and unforgettable celebrations. Let's raise our glasses to good times and cherished friends—cheers!`,
      deliveryTips: "Deliver with a warm smile right after welcome drinks are served. Keep it around 2 minutes."
    },
    {
      title: `Heartfelt Toast to ${hostName}`,
      role: "Best Friend / VIP Guest",
      speechText: `To ${hostName}: watching you reach this milestone is such an honor for all of us. You bring unmatched energy, kindness, and laughter everywhere you go. On behalf of everyone here at ${titleLabel}, we wish you the happiest year ahead, filled with health, big dreams, and pure joy. To ${hostName}!`,
      deliveryTips: "Best given right before the cake cutting or keynote dinner segment. Raise your glass at the end."
    },
    {
      title: `Vote of Thanks & Cake Cutting Address`,
      role: "Celebrant / Host",
      speechText: `Before we cut the cake and hit the dance floor, I want to say a huge heartfelt thank you to everyone who helped bring ${titleLabel} together—especially our wonderful friends, family, and organizers. Your love and presence tonight made this day truly magical. Thank you all, and let's enjoy the rest of the night!`,
      deliveryTips: "Gather everyone around the cake table. Keep it sweet, punchy, and energetic."
    }
  ];

  return {
    themes: themeMap[eventType] || themeMap.custom,
    activities: activityMap[eventType] || activityMap.custom,
    menus: finalMenus,
    invitationTemplates: [
      {
        style: "Contemporary & Polished",
        headline: `You're Cordially Invited to Celebrate: ${eventType.replace("_", " ").toUpperCase()}`,
        body: `We are thrilled to gather our favorite people for an extraordinary celebration filled with joy, connection, and unforgettable moments. Your presence would make this milestone complete.`,
        rsvpDeadlineText: "Kindly RSVP via Planora Portal 2 weeks prior to event date.",
      },
      {
        style: "Casual & Warm",
        headline: `Save the Date for an Unmissable Celebration!`,
        body: `Get ready for delicious bites, great music, and memories in the making. Dress comfortably, bring your best energy, and let's make this day legendary!`,
        rsvpDeadlineText: "Please let us know if you can make it by the deadline.",
      },
    ],
    musicPlaylists: [
      {
        vibe: "Euphoric & Uplifting Hits",
        recommendedGenres: ["Feel-Good Pop", "Indie Anthems", "Nu-Disco", "Timeless Classics"],
        songHighlights: ["September - Earth, Wind & Fire", "Levitating - Dua Lipa", "Can't Stop The Feeling - Justin Timberlake", "Dreams - Fleetwood Mac"],
      },
      {
        vibe: "Lounge & Ambient Warmth",
        recommendedGenres: ["Lo-Fi Chill", "Bossa Nova", "Acoustic Covers", "Neo-Soul"],
        songHighlights: ["Beyond - Leon Bridges", "Come Away With Me - Norah Jones", "Golden - Harry Styles (Acoustic)"],
      },
    ],
    speeches,
  };
}

/**
 * Handle AI Chat interactions with contextual memory
 */
export async function processAIChat(
  event: EventPlan,
  userMessage: string,
  apiKey?: string,
  provider: "auto" | "gemini" | "openai" = "auto",
  model?: string
): Promise<LLMResponse> {
  const normalizedMsg = userMessage.toLowerCase().trim();

  // If live Gemini or OpenAI API key is supplied, attempt live call
  if (apiKey) {
    try {
      if (provider === "openai" || (!provider.includes("gemini") && apiKey.startsWith("sk-"))) {
        return await callOpenAIChat(event, userMessage, apiKey, model);
      } else {
        return await callGeminiChat(event, userMessage, apiKey, model);
      }
    } catch (err) {
      console.warn("[Planora AI] External LLM call failed, falling back to autonomous engine:", err);
      // Fall through to autonomous generator
    }
  }

  // ──────────────────────────────────────────────────
  // AUTONOMOUS INTELLIGENCE ROUTER (no API key or API error fallback)
  // Uses broad fuzzy keyword matching to handle common requests
  // ──────────────────────────────────────────────────

  // BUDGET & COST queries
  if (/budget|cost|cut|save|reallocat|expens|spend|money|afford|cheap|pric/.test(normalizedMsg)) {
    const total = event.totalBudget;
    const spent = event.expenses.reduce((sum, exp) => sum + (exp.paid ? exp.amount : 0), 0);
    const remaining = total - spent;

    return {
      content: `💡 **Budget Optimization Analysis for ${event.title}**:\n\n• **Total Planned Budget**: ${event.currency} ${total.toLocaleString()}\n• **Spent / Committed**: ${event.currency} ${spent.toLocaleString()}\n• **Available Balance**: ${event.currency} ${remaining.toLocaleString()}\n\n**Actionable AI Recommendations**:\n1. **High-Impact Savings**: Review your "${event.budgetAllocations[0]?.category || "Venue"}" allocation. Booking off-peak days or requesting package bundling can reduce costs by 10-15%.\n2. **Contingency Buffer**: You have ${event.currency} ${((total * 0.08)).toFixed(0)} suggested as an emergency buffer. Keep this intact until 10 days before the event.\n3. **Catering Strategy**: Switching from full plated dinner to high-end grazing stations or family-style platters typically saves 18-22% on waitstaff and equipment rental fees!`,
      suggestedActions: [
        { label: "View Budget Breakdown", action: "OPEN_BUDGET_TAB" },
        { label: "Add An Expense", action: "OPEN_ADD_EXPENSE_MODAL" },
      ],
    };
  }

  // SPEECH / TOAST queries (matches speech, speach, spech, toast, welcome address, tell me speech, write speech, etc.)
  if (/spe+a?ch|toast|welcome.*(word|remark)|address|opening.*remark|speak|say.*few.*word|tell.*me.*spe+a?ch|give.*me.*spe+a?ch|write.*spe+a?ch|birthday.*spe+a?ch|wedding.*spe+a?ch|keynote|anchor|host.*script/i.test(normalizedMsg)) {
    const isBirthday = event.eventType === "birthday" || /birthday/i.test(event.title);
    const isWedding = event.eventType === "wedding" || /wedding/i.test(event.title);
    const hostName = event.title.split(/\s+(?:birthday|wedding|anniversary|party|celebration|bash)/i)[0] || "The Host";

    let speechText = "";
    if (isBirthday) {
      speechText = `🎤 **Personalized Birthday Toast for "${event.title}"**\n\n---\n\n*Dear friends, family, and honored guests,*\n\nThank you all for being here today at **${event.location || "this wonderful venue"}** to celebrate **${event.title}**! Having each of our ${event.guestCount} favorite people gathered in one place means more than words can express.\n\nLooking around this room, every single one of you has brought so much joy, laughter, and support to my journey. When we planned this **${event.theme}** celebration, our goal was to bring together the people who make life truly vibrant and memorable.\n\nTo another year of bolder adventures, deeper friendships, and uncontrollable laughter: please raise your glasses with me! **Happy Birthday, and cheers to all of you for making today unforgettable!** 🥂🎂\n\n*— With heartfelt love, ${hostName}*\n\n---\n\n💡 **Tips**: Personalize this speech by calling out 1 or 2 funny memories or thanking someone specifically for traveling to be here!`;
    } else if (isWedding) {
      speechText = `💍 **Personalized Wedding Toast for "${event.title}"**\n\n---\n\n*Distinguished family, cherished friends, and honored guests,*\n\nWelcome to **${event.location || "this beautiful celebration"}** as we honor **${event.title}**! To see all ${event.guestCount} of you surrounding us under our **${event.theme}** setting fills our hearts with immense gratitude.\n\nToday isn't just about two people coming together; it's about celebrating the love, the stories, and the friendships that brought us to this exact moment. May your glasses stay full, your feet keep dancing, and your hearts stay warm.\n\n**Here's to love that endures, friendships that never fade, and the greatest adventure of our lives!** 🥂✨\n\n*— With eternal gratitude, The Happy Couple*`;
    } else {
      const eventTypeLabel = event.eventType.replace(/_/g, " ");
      speechText = `🎤 **${eventTypeLabel.charAt(0).toUpperCase() + eventTypeLabel.slice(1)} Speech for "${event.title}"**\n\n---\n\n*Dear friends, family, and honored guests,*\n\nThank you all for being here today to celebrate **${event.title}**. Your presence at **${event.location || "this wonderful venue"}** means more than words can express, and I'm so grateful to share this special moment with each of our **${event.guestCount} incredible guests**.\n\nWhen I think about what makes today truly extraordinary, it's not just the beautiful **${event.theme}** setting or the great food and music—it's *you*. Every person in this room has made this milestone unforgettable.\n\nSo please, raise your glasses with me: **Here's to laughter, to friendship, and to the beautiful adventure ahead!** 🥂\n\n*— With heartfelt gratitude, ${hostName}*`;
    }

    return {
      content: speechText,
      suggestedActions: [
        { label: "View Speeches in Ideas", action: "OPEN_IDEAS_TAB" },
        { label: "Check Timeline", action: "OPEN_TIMELINE_TAB" },
      ],
    };
  }

  // GAMES & ACTIVITIES queries
  if (/game|icebreaker|activit|fun|entertain|play|quiz|trivia|danc/.test(normalizedMsg)) {
    return {
      content: `🎉 **Top 3 Curated Activities for ${event.eventType.replace("_", " ")}**:\n\n1. **The 'Guess the Year / Memory Box' Challenge**\n   Guests scan a QR code on their tables to guess which year key photos/milestones took place. Takes 15 mins and sparks instant table conversation!\n\n2. **Custom Polaroid Scavenger Hunt**\n   Leave 3 disposable or instant cameras per table with a list of 5 creative photo prompts (e.g. 'Funniest selfie with the host', 'Best dance pose', 'Group toast'). Guests pin photos to a memory board.\n\n3. **Speed Trivia Buzz**\n   A quick 10-question trivia game using our built-in trivia themes. Winning table gets the first turn at the dessert bar!`,
      suggestedActions: [
        { label: "Explore Ideas Tab", action: "OPEN_IDEAS_TAB" },
      ],
    };
  }

  // INVITATION / RSVP / EMAIL queries
  if (/invit|wording|rsvp|email|card|announc/.test(normalizedMsg)) {
    return {
      content: `✉️ **Personalized Invitation & Announcement Copy**:\n\n**Subject**: You're Invited: Celebrating ${event.title}! 🥂\n\n*Dear [Guest Name],*\n\nWe couldn't imagine marking this special milestone without the people who mean the most to us. Please join us for an evening of joy, celebration, and cherished memories!\n\n📅 **Date**: ${event.date || "Coming Soon"}\n📍 **Location**: ${event.location || "Venue TBA"}\n✨ **Theme**: ${event.theme}\n\nKindly confirm your RSVP and let us know about any dietary preferences by clicking the link below.\n\nWith love and excitement,\n*The Hosts*`,
      suggestedActions: [
        { label: "View Guest List", action: "OPEN_GUESTS_TAB" },
      ],
    };
  }

  // VENDOR queries
  if (/vendor|photograph|cater|dj|florist|baker|decorator|supplier|book|hire/.test(normalizedMsg)) {
    const vendorCount = event.vendors.length;
    const bookedCount = event.vendors.filter((v) => v.status === "booked").length;
    return {
      content: `📋 **Vendor Readiness Report**:\n\nYou currently have **${vendorCount} vendors** listed, with **${bookedCount} officially booked & locked in**.\n\n**Top Vendor Recommendations**:\n• **Check Deliverables**: Ensure contracts specify arrival time, setup duration, and overtime rates.\n• **Meal Policy**: Remember to include vendor meals in your catering headcounts for the photographer, videographer, and DJ who will work 6+ hours.\n• **Deposit Schedule**: Keep track of final balance due dates (typically 7-14 days prior to event).`,
      suggestedActions: [
        { label: "Manage Vendors", action: "OPEN_VENDORS_TAB" },
      ],
    };
  }

  // TIMELINE / SCHEDULE queries
  if (/timeline|schedule|when|milestone|deadline|checklist|countdown|plan.*day|run.*show/.test(normalizedMsg)) {
    const completedMilestones = event.milestones.filter(m => m.completed).length;
    const totalMilestones = event.milestones.length;
    const nextMilestone = event.milestones.find(m => !m.completed);
    return {
      content: `📅 **Timeline Progress for ${event.title}**:\n\n• **Milestones**: ${completedMilestones}/${totalMilestones} completed\n• **Run of Show**: ${event.runOfShow.length} scheduled blocks\n${nextMilestone ? `\n⏭️ **Next Up**: *${nextMilestone.title}* (${nextMilestone.timeframe})\n${nextMilestone.description}` : "\n✅ All milestones are on track!"}\n\n**Quick Tips**:\n1. Review your run-of-show timeline to ensure smooth transitions between activities\n2. Confirm all vendor arrival times align with your schedule\n3. Build in 15-minute buffers between major segments`,
      suggestedActions: [
        { label: "View Timeline", action: "OPEN_TIMELINE_TAB" },
      ],
    };
  }

  // MUSIC / PLAYLIST queries
  if (/music|playlist|song|dj|band|perform/.test(normalizedMsg)) {
    const playlists = event.ideas.musicPlaylists;
    const playlistInfo = playlists.length > 0
      ? playlists.map(p => `🎵 **${p.vibe}**: ${p.songHighlights.slice(0, 3).join(", ")}`).join("\n")
      : "No playlists configured yet";
    return {
      content: `🎶 **Music & Entertainment Guide for ${event.title}**:\n\n${playlistInfo}\n\n**DJ/Music Tips**:\n1. Start with ambient/lounge music during arrivals and dinner\n2. Transition to upbeat hits for the dance floor segment\n3. End with 2-3 nostalgic sing-along anthems before wind-down\n4. Always have a backup Bluetooth speaker in case of AV issues`,
      suggestedActions: [
        { label: "Explore Ideas", action: "OPEN_IDEAS_TAB" },
      ],
    };
  }

  // MENU / FOOD / CATERING queries
  if (/menu|food|cater|dinner|lunch|breakfast|snack|diet|veg|meal|drink|cocktail|bar/.test(normalizedMsg)) {
    const menus = event.ideas.menus;
    const menuInfo = menus.length > 0
      ? menus.map(m => `🍽️ **${m.title}**:\n${m.items.map(i => `   • ${i}`).join("\n")}\n   Dietary: ${m.dietaryHighlights.join(", ") || "Standard"}`).join("\n\n")
      : "No menus configured yet — let me suggest some!";
    return {
      content: `🍽️ **Menu & Catering Guide for ${event.title}**:\n\n${menuInfo}\n\n**Catering Tips for ${event.guestCount} guests**:\n• Plan for 6-8 appetizer pieces per person for cocktail hour\n• Order 10% extra meals to account for plus-ones and vendor meals\n• Confirm dietary restrictions at least 1 week before the event`,
      suggestedActions: [
        { label: "View Budget", action: "OPEN_BUDGET_TAB" },
        { label: "Explore Ideas", action: "OPEN_IDEAS_TAB" },
      ],
    };
  }

  // GUEST / RSVP tracking queries
  if (/guest|attend|rsvp.*track|who.*com|headcount|seat/.test(normalizedMsg)) {
    const attending = event.guests.filter(g => g.rsvpStatus === "attending").length;
    const pending = event.guests.filter(g => g.rsvpStatus === "pending").length;
    const declined = event.guests.filter(g => g.rsvpStatus === "declined").length;
    return {
      content: `👥 **Guest Status Report for ${event.title}**:\n\n• ✅ **Attending**: ${attending}\n• ⏳ **Pending RSVP**: ${pending}\n• ❌ **Declined**: ${declined}\n• **Total Invited**: ${event.guests.length} (target: ${event.guestCount})\n\n**Action Items**:\n1. Follow up with pending RSVPs — send a friendly reminder\n2. Confirm dietary preferences for confirmed guests\n3. Update seating arrangements as confirmations come in`,
      suggestedActions: [
        { label: "View Guest List", action: "OPEN_GUESTS_TAB" },
      ],
    };
  }

  // DECOR / THEME queries
  if (/decor|theme|color|style|design|flower|balloon|light|backdrop/.test(normalizedMsg)) {
    const themes = event.ideas.themes;
    const themeInfo = themes.length > 0
      ? themes.map(t => `✨ **${t.name}**: ${t.description}\n   Colors: ${t.colorPalette.join(", ")}\n   Vibes: ${t.vibes}`).join("\n\n")
      : `Current theme: **${event.theme}**`;
    return {
      content: `🎨 **Decor & Theme Ideas for ${event.title}**:\n\n${themeInfo}\n\n**Decor Tips**:\n1. Choose a max of 3 dominant colors for visual cohesion\n2. Layer lighting: string lights + candles + spotlights for depth\n3. Create an Instagram-worthy photo corner with props matching your theme\n4. Use tablescaping to tie the color palette together across the venue`,
      suggestedActions: [
        { label: "Explore Ideas", action: "OPEN_IDEAS_TAB" },
      ],
    };
  }

  // Default contextual assistant response (catch-all)
  return {
    content: `I'm here to help you plan every detail of **${event.title}**! Here's what I can help with:\n\n• 💰 **Budget**: "How can I optimize my ${event.currency} ${event.totalBudget.toLocaleString()} budget?"\n• 🎤 **Speeches**: "Write a birthday speech" or "Draft a welcome toast"\n• 🎉 **Activities**: "Suggest fun games for ${event.guestCount} guests"\n• ✉️ **Invitations**: "Write an invitation email"\n• 📋 **Vendors**: "Review my vendor bookings"\n• 📅 **Timeline**: "Show my event schedule"\n• 🍽️ **Menu**: "Suggest a vegetarian menu"\n• 🎶 **Music**: "Create a party playlist"\n• 🎨 **Decor**: "Suggest decor ideas for ${event.theme}"\n\nJust type your question and I'll provide personalized advice!`,
    suggestedActions: [
      { label: "Review Budget", action: "OPEN_BUDGET_TAB" },
      { label: "Check Timeline", action: "OPEN_TIMELINE_TAB" },
      { label: "View Ideas", action: "OPEN_IDEAS_TAB" },
    ],
  };
}

/**
 * Build a rich system prompt for AI chat, giving full event context
 */
function buildChatSystemPrompt(event: EventPlan): string {
  const spent = event.expenses.reduce((sum, exp) => sum + (exp.paid ? exp.amount : 0), 0);
  const remaining = event.totalBudget - spent;
  const attending = event.guests.filter(g => g.rsvpStatus === "attending").length;
  const pending = event.guests.filter(g => g.rsvpStatus === "pending").length;
  const completedMilestones = event.milestones.filter(m => m.completed).length;

  return `You are Planora AI — an expert event planner, creative stylist, speech writer, budget advisor, and entertainment consultant. You help users plan AMAZING events.

FULL EVENT CONTEXT:
━━━━━━━━━━━━━━━━━━
• Title: ${event.title}
• Type: ${event.eventType.replace(/_/g, " ")}
• Theme: ${event.theme}
• Date: ${event.date || "TBD"}
• Location: ${event.location || "TBD"}
• Guest Count: ${event.guestCount} (${attending} confirmed, ${pending} pending)
• Budget: ${event.currency} ${event.totalBudget.toLocaleString()} (Spent: ${event.currency} ${spent.toLocaleString()}, Remaining: ${event.currency} ${remaining.toLocaleString()})

BUDGET BREAKDOWN:
${event.budgetAllocations.map(b => `  • ${b.category}: ${event.currency} ${b.allocatedAmount.toLocaleString()} (spent: ${event.currency} ${b.spentAmount.toLocaleString()})`).join("\n")}

MILESTONES: ${completedMilestones}/${event.milestones.length} completed
${event.milestones.slice(0, 5).map(m => `  ${m.completed ? "✅" : "⬜"} ${m.timeframe}: ${m.title}`).join("\n")}

VENDORS:
${event.vendors.length > 0 ? event.vendors.map(v => `  • ${v.name} (${v.category}) — Status: ${v.status}${v.quotedPrice ? `, Quoted: ${event.currency} ${v.quotedPrice}` : ""}`).join("\n") : "  No vendors added yet."}

SPECIAL NOTES: ${event.notes || "None"}

YOUR CAPABILITIES — you MUST handle ALL of these:
1. **Speeches & Toasts**: Write complete, heartfelt speeches, welcome addresses, toasts, thank-you notes
2. **Budget Optimization**: Analyze spending, suggest cuts, reallocate budgets, calculate per-guest costs
3. **Activity & Games**: Suggest icebreakers, party games, entertainment ideas tailored to the event
4. **Invitations**: Draft invitation text, RSVP reminders, email templates
5. **Vendor Advice**: Negotiate tips, comparison advice, contract guidance
6. **Menu Planning**: Suggest menus, dietary accommodations, catering strategies
7. **Music & Playlists**: Curate playlist suggestions, DJ instructions, ceremony music
8. **Decor & Themes**: Color palettes, decoration ideas, photo booth concepts
9. **Timeline Management**: Schedule optimization, day-of logistics, contingency planning
10. **Guest Management**: Seating arrangements, RSVP follow-ups, dietary tracking

RESPONSE RULES:
- Be warm, enthusiastic, and professional
- Use markdown formatting with headers, bullet points, and bold text
- Provide SPECIFIC, ACTIONABLE advice — never generic
- Personalize everything to "${event.title}" and the event details above
- When asked for speeches/toasts, write the COMPLETE speech text (not just tips)
- Use emojis sparingly for visual appeal
- Keep responses focused and under 500 words unless writing a speech`;
}

async function callGeminiChat(
  event: EventPlan,
  userMessage: string,
  apiKey: string,
  modelName?: string
): Promise<LLMResponse> {
  const primaryModel = resolveGeminiModel(modelName);
  const modelsToTry = [primaryModel, "gemini-flash-latest", "gemini-3.8-flash"].filter((m, idx, arr) => arr.indexOf(m) === idx);
  const systemPrompt = buildChatSystemPrompt(event);

  let lastError: Error | null = null;
  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
      const body = {
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: userMessage },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 2048,
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        let errorDetail = res.statusText;
        try {
          const errorJson = await res.json();
          if (errorJson?.error?.message) {
            errorDetail = errorJson.error.message;
          }
        } catch { }
        throw new Error(`Gemini API error (${res.status}): ${errorDetail}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return {
          content: text,
          suggestedActions: inferSuggestedActions(userMessage),
        };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Planora AI] Gemini chat attempt with ${model} failed:`, err?.message || err);
    }
  }

  throw lastError || new Error("Failed to generate chat response from Gemini");
}

async function callOpenAIChat(
  event: EventPlan,
  userMessage: string,
  apiKey: string,
  modelName?: string
): Promise<LLMResponse> {
  const cleanModel = (modelName || "gpt-4o-mini").trim();
  const url = "https://api.openai.com/v1/chat/completions";
  const systemPrompt = buildChatSystemPrompt(event);

  const isReasoningModel = cleanModel.startsWith("o1") || cleanModel.startsWith("o3");
  const body: Record<string, unknown> = {
    model: cleanModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  };

  if (isReasoningModel) {
    body.max_completion_tokens = 2048;
  } else {
    body.temperature = 0.75;
    body.max_tokens = 2048;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errorJson = await res.json();
      if (errorJson?.error?.message) {
        errorDetail = errorJson.error.message;
      }
    } catch { }
    throw new Error(`OpenAI API error (${res.status}): ${errorDetail}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "No response received.";

  return {
    content: text,
    suggestedActions: inferSuggestedActions(userMessage),
  };
}

/**
 * Infer contextual suggested actions from the user's message
 */
function inferSuggestedActions(userMessage: string): LLMResponse["suggestedActions"] {
  const msg = userMessage.toLowerCase();
  if (/budget|cost|expens|money/.test(msg)) {
    return [
      { label: "View Budget", action: "OPEN_BUDGET_TAB" },
      { label: "Add Expense", action: "OPEN_ADD_EXPENSE_MODAL" },
    ];
  }
  if (/speech|toast|speach/.test(msg)) {
    return [
      { label: "View Guest List", action: "OPEN_GUESTS_TAB" },
      { label: "Check Timeline", action: "OPEN_TIMELINE_TAB" },
    ];
  }
  if (/vendor|book|hire/.test(msg)) {
    return [{ label: "Manage Vendors", action: "OPEN_VENDORS_TAB" }];
  }
  if (/timeline|schedule|milestone/.test(msg)) {
    return [{ label: "View Timeline", action: "OPEN_TIMELINE_TAB" }];
  }
  if (/guest|rsvp|attend/.test(msg)) {
    return [{ label: "View Guests", action: "OPEN_GUESTS_TAB" }];
  }
  return [
    { label: "Review Budget", action: "OPEN_BUDGET_TAB" },
    { label: "Check Timeline", action: "OPEN_TIMELINE_TAB" },
    { label: "Explore Ideas", action: "OPEN_IDEAS_TAB" },
  ];
}

