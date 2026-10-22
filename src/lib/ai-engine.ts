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
} from "@/types";

/**
 * Planora AI Generator & Intelligent Engine
 * Supports:
 * 1. Live Google Gemini API (gemini-1.5-flash or gemini-pro)
 * 2. Live OpenAI API (gpt-4o-mini / gpt-3.5)
 * 3. Deep Autonomous Rule-Based Knowledge Engine (works 100% offline/out-of-the-box with zero API key)
 */

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

// Generates an end-to-end plan using the internal AI rules
export function generateAutonomousPlan(input: GenerateEventPlanInput): Omit<EventPlan, "id" | "createdAt" | "updatedAt"> {
  const currency = input.currency || "USD";
  const budget = Math.max(500, input.budget || 5000);
  const guestCount = Math.max(10, input.guestCount || 50);
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

  // 4. Vendors Needed
  const vendors: Vendor[] = getVendorsForType(eventType, budgetAllocations);

  // 5. Personalized Ideas & Suggestions
  const ideas: EventIdeas = getIdeasForType(eventType, input.stylePreferences);

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

function getVendorsForType(eventType: EventType, allocations: BudgetItem[]): Vendor[] {
  const vendorProfiles: Record<string, { category: string; defaultVendor: string; status: Vendor["status"] }> = {
    "Venue & Rentals": { category: "Venue", defaultVendor: "Grand Horizon Event Center", status: "booked" },
    "Venue Rental": { category: "Venue", defaultVendor: "Loft 42 Penthouse & Terrace", status: "booked" },
    "Permits, Security & City Fees": { category: "Government & Permits", defaultVendor: "City Municipal Event Desk", status: "booked" },
    "Catering & Bar": { category: "Catering", defaultVendor: "Savor Artisan Kitchen & Bar", status: "quote_received" },
    "Food & Finger Bites": { category: "Catering", defaultVendor: "BiteCraft Catering Co.", status: "quote_received" },
    "Main Stage & Artist Headliner": { category: "Artist Agency", defaultVendor: "Apex Music Bookings", status: "shortlisted" },
    "Photography & Videography": { category: "Photography", defaultVendor: "Aura Cinematic Photography", status: "booked" },
    "Decor & Floral Design": { category: "Decor & Floral", defaultVendor: "Petals & Velvet Event Styling", status: "contacted" },
    "Entertainment & Music": { category: "Music & DJ", defaultVendor: "Sonic Wave DJ & Sound Hire", status: "contacted" },
    "Sound, Stage & Lighting (AV)": { category: "Audio/Visual", defaultVendor: "StageCraft Pro AV Rentals", status: "booked" },
  };

  return allocations.slice(0, 5).map((alloc, idx) => {
    const profile = vendorProfiles[alloc.category] || {
      category: alloc.category,
      defaultVendor: `${alloc.category} Specialist Group`,
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

function getIdeasForType(eventType: EventType, preferences?: string): EventIdeas {
  const themeMap: Record<EventType, EventIdeas["themes"]> = {
    wedding: [
      {
        name: "Opulent Rose Gold & Emerald Twilight",
        description: "Deep forest greens, soft blush roses, warm ambient candlelight, and geometric brass arches.",
        colorPalette: ["#1B4332", "#B76E79", "#D4AF37", "#F8F9FA"],
        vibes: "Timeless, luxury, romantic, enchanting",
        decorations: [
          "Geometric Brass Ceremony Arch with White Roses & Emerald Ivy",
          "Draped Warm Fairy Light Canopy & Floor Uplighting",
          "Welcome Signboard on Brass Easel with Custom Calligraphy",
          "Chiavari Chairs with Silk Ribbons & Eucalyptus Sprigs",
          "Tall Crystal Candelabras with Glass Votive Centerpieces",
          "Aisle Runner Carpet with Scattered Silk Rose Petals",
          "Custom Monogram Dance Floor Lighting Projection",
          "Velvet Table Runners & Satin Napkin Rings"
        ],
      },
      {
        name: "Coastal Minimalist Riviera",
        description: "Breezy ivory linens, raw sandstone, olive branch sprigs, and gentle acoustic maritime tunes.",
        colorPalette: ["#023E8A", "#0077B6", "#E9D8A6", "#FFFFFF"],
        vibes: "Effortless, chic, sun-drenched, serene",
        decorations: [
          "Driftwood Wedding Canopy with Linen Draping",
          "Olive Branch & White Peony Table Runners",
          "Woven Rattan Lanterns & Pillar Candles",
          "Custom Wooden Welcome Board on Driftwood Stand",
          "Seashell & Linen Favor Bags with Calligraphy Tags"
        ],
      },
    ],
    birthday: [
      {
        name: "Electric Neon Arcade & Disco Retro",
        description: "Vibrant ultraviolet lasers, magenta and cyan LED glow props, 80s synthesizer vibes and glitter.",
        colorPalette: ["#FF007F", "#00F0FF", "#7B2CBF", "#FFE600"],
        vibes: "High energy, nostalgic, thrilling, photogenic",
        decorations: [
          "Custom LED Neon Name & Number Birthday Sign",
          "Ultraviolet (UV) Blacklight Projectors & Haze Lighting",
          "12-Inch Mirrored Disco Balls with Rotating Ceiling Motor",
          "Cyberpunk Balloon Garland (Chrome Cyan, Magenta & Black)",
          "Glow Sticks, UV Neon Face Paints & LED Foam Party Batons",
          "Holographic Photo-Wall Backdrop with Retro Arcade Props",
          "Cake Table Neon Runner with Floating LED Candles",
          "Fluorescent Tableware, Cups & Confetti Cannon"
        ],
      },
      {
        name: "Velvet Speakeasy & Golden Glamour",
        description: "Moody vintage jazz club aesthetics, antique gold cocktail shakers, dim Edison bulbs, and velvet couches.",
        colorPalette: ["#1C1917", "#D97706", "#78350F", "#FAFAF9"],
        vibes: "Sophisticated, exclusive, jazzy, cozy",
        decorations: [
          "Vintage Edison Bulb Filament String Fixtures",
          "Gold Brass Cocktail Bar Signs & Menu Stands",
          "Deep Burgundy Velvet Drapes & Antique Mirrors",
          "Smoked Glass Tealight Holders & Art Deco Table Numbers",
          "Gramophone & Vinyl Record Photo Corner Display"
        ],
      },
    ],
    college_festival: [
      {
        name: "Cyber-Nexus: Future Tech & Bass Beats",
        description: "Holographic accents, glowing circuit patterns, heavy EDM bass drops, and robotic LED installations.",
        colorPalette: ["#00F5D4", "#7B2CBF", "#F72585", "#0F172A"],
        vibes: "Futuristic, electrifying, youthful, explosive",
        decorations: [
          "Truss Lighting Rig with Moving Beam Lasers",
          "Giant LED Screen Stage Backdrop & Side Scrims",
          "Holographic Gate Arches & Circuit Board Glow Decals",
          "Neon Directional Neon Pointers across Campus",
          "Festival Wristbands & Glow Batons for Crowd"
        ],
      },
      {
        name: "Bohemian Sunset Carnival",
        description: "Dreamcatchers, acoustic lawns, indie art stalls, fairy lights across trees, and open-air jam circles.",
        colorPalette: ["#E76F51", "#F4A261", "#E9C46A", "#2A9D8F"],
        vibes: "Artistic, free-spirited, communal, melodic",
        decorations: [
          "Festoon Fairy Lights Strung Between Trees",
          "Handmade Dreamcatcher & Macrame Photo Booth",
          "Rustic Wooden Palette Seating with Tribal Cushions",
          "Chalkboard Signposts & Burlap Festival Bunting"
        ],
      },
    ],
    community_event: [
      {
        name: "Harvest Harmony & Eco-Fair",
        description: "Sustainable bamboo stalls, wildflower gardens, local acoustic folk artists, zero plastic waste.",
        colorPalette: ["#2D6A4F", "#52B788", "#D8F3DC", "#B7B7A4"],
        vibes: "Warm, inclusive, wholesome, uplifting",
        decorations: [
          "Weatherproof Welcome Vinyl Arch Banner & Kiosk Sign",
          "Festoon Edison Bulb String Lighting along Pathways",
          "Color-Coded Wayfinding Directional Signboards",
          "Eco-Friendly Burlap Bunting, Hay Bales & Wooden Fruit Crates",
          "Artisan Stall Canopy Tents with Branded Tablecloths",
          "Flower Pot Table Centerpieces & Wildflower Seed Packet Favors",
          "Amphitheater Stage Backdrop Banner & Speaker Covers",
          "Clearly Labeled Eco-Friendly Recycling & Compost Stations"
        ],
      },
    ],
    anniversary: [
      {
        name: "Golden Jubilee & Starlight Memories",
        description: "Brushed champagne gold, crystal chandeliers, archival memory photo wall, and vintage strings.",
        colorPalette: ["#D4AF37", "#FFF8DC", "#4A0E4E", "#111827"],
        vibes: "Regal, emotional, honoring, intimate",
        decorations: [
          "Golden Shimmer Sequin Wall Backdrop",
          "Curated Archival Photo Memory Timeline with Fairy Lights",
          "Gold-Rimmed Glass Charger Plates & Satin Napkin Rings",
          "Tall Floral Centerpieces with Champagne Roses & Baby's Breath",
          "Illuminated Golden Monogram & Number Marquee Lights",
          "Custom Acrylic Table Numbers on Wooden Bases"
        ],
      },
    ],
    corporate_social: [
      {
        name: "Metropolitan Skyline Gala",
        description: "Clean architectural lines, sleek glass tableware, indigo uplighting, and modern lounge chillout.",
        colorPalette: ["#1E3A8A", "#3B82F6", "#94A3B8", "#0F172A"],
        vibes: "Polished, prestigious, inspiring, networking-friendly",
        decorations: [
          "Branded Step-and-Repeat Media Wall with Carpet",
          "Indigo & Cyan Architectural Wall Uplighting",
          "Illuminated Acrylic High-Top Cocktail Tables",
          "Minimalist Geometric Succulent Centerpieces",
          "Company Milestone Wall Panels & Award Pedestals"
        ],
      },
    ],
    baby_shower: [
      {
        name: "Storybook Garden & Pastel Dreams",
        description: "Whimsical floral arrangements, pastel mint and buttercup yellow bunting, and vintage children's books.",
        colorPalette: ["#A8DADC", "#F1FAEE", "#E63946", "#FFE3E0"],
        vibes: "Gentle, heartwarming, joyful, delicate",
        decorations: [
          "Organic Pastel Balloon Arch & Teddy Bear Props",
          "Personalized Wooden Name Plaque & Flower Wall",
          "White Wooden Highchair Decorated with Greenery",
          "Pastel Floral Table Centerpieces in Ceramic Pitchers",
          "Keepsake Advice Tree with Ribbon Cards"
        ],
      },
    ],
    cultural_gathering: [
      {
        name: "Festive Heritage & Radiant Lamps",
        description: "Marigold yellow, auspicious vermilion red, traditional brass lamps, and fragrant sandalwood.",
        colorPalette: ["#DC2626", "#F59E0B", "#FBBF24", "#7F1D1D"],
        vibes: "Sacred, jubilant, traditional, bonding",
        decorations: [
          "Fresh Orange & Yellow Marigold Floral Torans & Garlands",
          "Traditional Ornate Brass Diya Lamps with Floral Floating Urli",
          "Rangoli Art Design at Grand Entrance",
          "Rich Brocade Silk Backdrop Drapes & Floor Cushions",
          "Brass Bells, Mango Leaf Door Hangings & Incense Burners"
        ],
      },
    ],
    custom: [
      {
        name: "Modern Contemporary Harmony",
        description: "Balanced neutral palette with vibrant pops of color tailored to the event vision.",
        colorPalette: ["#6366F1", "#EC4899", "#F3F4F6", "#111827"],
        vibes: "Clean, inviting, adaptable",
        decorations: [
          "Custom Entrance Welcome Banner & Easel",
          "Ambient Warm String Lighting & LED Uplights",
          "Themed Balloon Garland & Photo Backdrop",
          "Coordinated Table Linens, Runners & Centerpieces",
          "Directional Signage & Favor Display Table"
        ],
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

  return {
    themes: themeMap[eventType] || themeMap.custom,
    activities: activityMap[eventType] || activityMap.custom,
    menus: menuMap[eventType] || menuMap.custom,
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
  };
}

/**
 * Handle AI Chat interactions with contextual memory
 */
export async function processAIChat(
  event: EventPlan,
  userMessage: string,
  apiKey?: string,
  provider: "auto" | "gemini" | "openai" = "auto"
): Promise<LLMResponse> {
  const normalizedMsg = userMessage.toLowerCase().trim();

  // If live Gemini or OpenAI API key is supplied, attempt live call
  if (apiKey) {
    try {
      if (provider === "openai" || (!provider.includes("gemini") && apiKey.startsWith("sk-"))) {
        return await callOpenAIChat(event, userMessage, apiKey);
      } else {
        return await callGeminiChat(event, userMessage, apiKey);
      }
    } catch (err) {
      console.warn("[Planora AI] External LLM call failed, falling back to autonomous engine:", err);
      // Fall through to autonomous generator
    }
  }

  // Autonomous Intelligence Router
  if (normalizedMsg.includes("budget") || normalizedMsg.includes("cut") || normalizedMsg.includes("save") || normalizedMsg.includes("cost") || normalizedMsg.includes("reallocate")) {
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

  if (normalizedMsg.includes("game") || normalizedMsg.includes("icebreaker") || normalizedMsg.includes("activity") || normalizedMsg.includes("fun")) {
    return {
      content: `🎉 **Top 3 Curated Activities for ${event.eventType.replace("_", " ")}**:\n\n1. **The 'Guess the Year / Memory Box' Challenge**\n   Guests scan a QR code on their tables to guess which year key photos/milestones took place. Takes 15 mins and sparks instant table conversation!\n\n2. **Custom Polaroid Scavenger Hunt**\n   Leave 3 disposable or instant cameras per table with a list of 5 creative photo prompts (e.g. 'Funniest selfie with the host', 'Best dance pose', 'Group toast'). Guests pin photos to a memory board.\n\n3. **Speed Trivia Buzz**\n   A quick 10-question trivia game using our built-in trivia themes. Winning table gets the first turn at the dessert bar!`,
      suggestedActions: [
        { label: "Explore Ideas Tab", action: "OPEN_IDEAS_TAB" },
      ],
    };
  }

  if (normalizedMsg.includes("invite") || normalizedMsg.includes("wording") || normalizedMsg.includes("rsvp") || normalizedMsg.includes("email") || normalizedMsg.includes("speech")) {
    return {
      content: `✉️ **Personalized Invitation & Announcement Copy**:\n\n**Subject**: You're Invited: Celebrating ${event.title}! 🥂\n\n*Dear [Guest Name],*\n\nWe couldn't imagine marking this special milestone without the people who mean the most to us. Please join us for an evening of joy, celebration, and cherished memories!\n\n📅 **Date**: ${event.date || "Coming Soon"}\n📍 **Location**: ${event.location || "Venue TBA"}\n✨ **Theme**: ${event.theme}\n\nKindly confirm your RSVP and let us know about any dietary preferences by clicking the link below.\n\nWith love and excitement,\n*The Hosts*`,
      suggestedActions: [
        { label: "View Guest List", action: "OPEN_GUESTS_TAB" },
      ],
    };
  }

  if (normalizedMsg.includes("vendor") || normalizedMsg.includes("photographer") || normalizedMsg.includes("catering") || normalizedMsg.includes("dj")) {
    const vendorCount = event.vendors.length;
    const bookedCount = event.vendors.filter((v) => v.status === "booked").length;
    return {
      content: `📋 **Vendor Readiness Report**:\n\nYou currently have **${vendorCount} vendors** listed, with **${bookedCount} officially booked & locked in**.\n\n**Top Vendor Recommendations**:\n• **Check Deliverables**: Ensure contracts specify arrival time, setup duration, and overtime rates.\n• **Meal Policy**: Remember to include vendor meals in your catering headcounts for the photographer, videographer, and DJ who will work 6+ hours.\n• **Deposit Schedule**: Keep track of final balance due dates (typically 7-14 days prior to event).`,
      suggestedActions: [
        { label: "Manage Vendors", action: "OPEN_VENDORS_TAB" },
      ],
    };
  }

  // Default contextual assistant response
  return {
    content: `I'm here to help you optimize every aspect of **${event.title}**! You can ask me to:\n\n• **Reallocate budgets** or calculate realistic per-guest costs\n• **Generate speech outlines**, welcome toasts, or invitation text\n• **Brainstorm unique icebreaker games** or decor themes\n• **Draft vendor emails** or timeline checklists\n• **Suggest music playlists** and day-of run of show adjustments\n\nWhat would you like to work on next?`,
    suggestedActions: [
      { label: "Review Budget", action: "OPEN_BUDGET_TAB" },
      { label: "Check Timeline", action: "OPEN_TIMELINE_TAB" },
      { label: "View Ideas", action: "OPEN_IDEAS_TAB" },
    ],
  };
}

async function callGeminiChat(event: EventPlan, userMessage: string, apiKey: string): Promise<LLMResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const systemPrompt = `You are Planora AI, an expert event planner, financial advisor, and creative stylist.
Current Event Context:
- Title: ${event.title} (${event.eventType})
- Total Budget: ${event.currency} ${event.totalBudget}
- Guest Count: ${event.guestCount}
- Date: ${event.date}
- Location: ${event.location}
- Theme: ${event.theme}
- Current Vendors: ${event.vendors.map((v) => `${v.name} (${v.category}: ${v.status})`).join(", ")}
Provide concise, highly actionable, friendly advice with clear bullet points.`;

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
      temperature: 0.7,
      maxOutputTokens: 800,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.statusText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to generate a response from Gemini.";

  return {
    content: text,
    suggestedActions: [
      { label: "Apply to Budget", action: "OPEN_BUDGET_TAB" },
      { label: "Check Timeline", action: "OPEN_TIMELINE_TAB" },
    ],
  };
}

async function callOpenAIChat(event: EventPlan, userMessage: string, apiKey: string): Promise<LLMResponse> {
  const url = "https://api.openai.com/v1/chat/completions";
  const systemPrompt = `You are Planora AI, an elite event planner and budget strategist.
Event context: Title=${event.title}, Type=${event.eventType}, Budget=${event.currency} ${event.totalBudget}, Guests=${event.guestCount}, Location=${event.location}.
Provide clear, inspiring, practical event planning advice.`;

  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 800,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.statusText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "No response received.";

  return {
    content: text,
    suggestedActions: [
      { label: "Review Timeline", action: "OPEN_TIMELINE_TAB" },
      { label: "Vendor List", action: "OPEN_VENDORS_TAB" },
    ],
  };
}
