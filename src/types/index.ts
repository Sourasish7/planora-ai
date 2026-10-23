export type EventType =
  | "wedding"
  | "birthday"
  | "anniversary"
  | "college_festival"
  | "community_event"
  | "corporate_social"
  | "baby_shower"
  | "cultural_gathering"
  | "custom";

export interface BudgetItem {
  id: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  paid: boolean;
  paidDate?: string;
  paymentMethod?: string;
  vendorId?: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  timeframe: string; // e.g. "6 Months Before", "1 Month Before", "1 Week Before", "Day Before"
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  assignedTo?: string;
}

export interface RunOfShowItem {
  id: string;
  time: string; // e.g., "09:00 AM"
  activity: string;
  personInCharge: string;
  location: string;
  status: "upcoming" | "in_progress" | "completed";
  notes?: string;
}

export type VendorStatus =
  | "researching"
  | "contacted"
  | "quote_received"
  | "shortlisted"
  | "booked"
  | "completed";

export interface Vendor {
  id: string;
  name: string;
  category: string;
  status: VendorStatus;
  contactName?: string;
  phone?: string;
  email?: string;
  website?: string;
  quotedPrice: number;
  finalPrice?: number;
  contractSigned: boolean;
  depositPaid: boolean;
  notes?: string;
}

export interface ThemeIdea {
  name: string;
  description: string;
  colorPalette: string[];
  vibes: string;
  decorations?: string[];
}

export interface ActivityIdea {
  title: string;
  targetGroup: string;
  description: string;
  duration: string;
}

export interface MenuIdea {
  title: string;
  items: string[];
  dietaryHighlights: string[];
}

export interface InvitationTemplate {
  style: string;
  headline: string;
  body: string;
  rsvpDeadlineText: string;
}

export interface MusicPlaylistIdea {
  vibe: string;
  recommendedGenres: string[];
  songHighlights: string[];
}

export interface SpeechIdea {
  title: string;
  role: string; // e.g. "Host Welcome Toast", "Best Friend / Keynote", "Heartfelt Thank You"
  speechText: string;
  deliveryTips: string;
}

export interface EventIdeas {
  themes: ThemeIdea[];
  activities: ActivityIdea[];
  menus: MenuIdea[];
  invitationTemplates: InvitationTemplate[];
  musicPlaylists: MusicPlaylistIdea[];
  speeches?: SpeechIdea[];
}

export type RSVPStatus = "attending" | "declined" | "pending";

export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: RSVPStatus;
  plusOnes: number;
  dietary: string;
  tableAssignment?: string;
  invitationSent: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: string;
    payload?: Record<string, unknown>;
  }[];
}

export interface EventPlan {
  id: string;
  title: string;
  eventType: EventType;
  theme: string;
  date: string;
  location: string;
  guestCount: number;
  currency: string; // "USD" | "INR" | "EUR" | "GBP" etc.
  totalBudget: number;
  notes?: string;
  budgetAllocations: BudgetItem[];
  expenses: Expense[];
  milestones: Milestone[];
  runOfShow: RunOfShowItem[];
  vendors: Vendor[];
  ideas: EventIdeas;
  guests: Guest[];
  chatHistory: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface PlanoraDatabase {
  events: EventPlan[];
  userSettings: {
    preferredCurrency: string;
    apiKey?: string;
    aiProvider: "auto" | "gemini" | "openai";
    aiModel?: string;
    theme: "dark" | "light" | "system";
  };
  auditLogs: {
    id: string;
    timestamp: string;
    action: string;
    details: string;
  }[];
}

export interface GenerateEventPlanInput {
  title: string;
  eventType: EventType;
  date?: string;
  location?: string;
  guestCount: number;
  budget: number;
  currency?: string;
  stylePreferences?: string;
  specialRequests?: string;
  apiKey?: string;
}
