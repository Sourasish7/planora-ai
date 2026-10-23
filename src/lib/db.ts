import fs from "fs";
import path from "path";
import type {
  EventPlan,
  PlanoraDatabase,
  BudgetItem,
  Expense,
  Milestone,
  RunOfShowItem,
  Vendor,
  Guest,
  ChatMessage,
} from "@/types";
import { sanitizeObject } from "./security";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "planora-db.json");
const DB_TMP_FILE = path.join(DATA_DIR, "planora-db.json.tmp");

import { SEED_DATA } from "./seed-data";

// Ensure data folder and database file exist
function ensureDatabase(): PlanoraDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2), "utf8");
      return SEED_DATA;
    }

    const raw = fs.readFileSync(DB_FILE, "utf8");
    if (!raw.trim()) {
      fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2), "utf8");
      return SEED_DATA;
    }

    const parsed: PlanoraDatabase = JSON.parse(raw);
    if (!parsed.events || !Array.isArray(parsed.events)) {
      parsed.events = SEED_DATA.events;
    }
    if (!parsed.userSettings) {
      parsed.userSettings = SEED_DATA.userSettings;
    }
    if (!parsed.auditLogs) {
      parsed.auditLogs = SEED_DATA.auditLogs;
    }
    return parsed;
  } catch (err) {
    console.error("[Database] Error reading database, resetting to seed:", err);
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2), "utf8");
    } catch {
      // ignore
    }
    return SEED_DATA;
  }
}

// Atomic save using temporary file + rename to prevent data corruption
function saveDatabase(data: PlanoraDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(DB_TMP_FILE, serialized, "utf8");
    fs.renameSync(DB_TMP_FILE, DB_FILE);
  } catch (err) {
    console.error("[Database] Failed to write database atomically, falling back to direct write:", err);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  }
}

// Memory cache for sub-millisecond lookups
let inMemoryDb: PlanoraDatabase | null = null;

function getDb(): PlanoraDatabase {
  if (!inMemoryDb) {
    inMemoryDb = ensureDatabase();
  }
  return inMemoryDb;
}

function persistDb(db: PlanoraDatabase): void {
  inMemoryDb = db;
  saveDatabase(db);
}

// CRUD Operations
export const db = {
  // Events
  getAllEvents(): EventPlan[] {
    const database = getDb();
    return database.events.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  getEventById(id: string): EventPlan | null {
    const database = getDb();
    return database.events.find((e) => e.id === id) || null;
  },

  createEvent(event: Omit<EventPlan, "id" | "createdAt" | "updatedAt">): EventPlan {
    const database = getDb();
    const now = new Date().toISOString();
    const newEvent: EventPlan = sanitizeObject({
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    });

    database.events.unshift(newEvent);
    database.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      action: "CREATE_EVENT",
      details: `Created event '${newEvent.title}' (${newEvent.eventType})`,
    });

    persistDb(database);
    return newEvent;
  },

  updateEvent(id: string, updates: Partial<EventPlan>): EventPlan | null {
    const database = getDb();
    const index = database.events.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const existing = database.events[index];
    const updated: EventPlan = sanitizeObject({
      ...existing,
      ...updates,
      id: existing.id, // prevent ID overwrite
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    database.events[index] = updated;
    database.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "UPDATE_EVENT",
      details: `Updated event '${updated.title}'`,
    });

    persistDb(database);
    return updated;
  },

  deleteEvent(id: string): boolean {
    const database = getDb();
    const initialLen = database.events.length;
    database.events = database.events.filter((e) => e.id !== id);

    if (database.events.length !== initialLen) {
      database.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: "DELETE_EVENT",
        details: `Deleted event ID: ${id}`,
      });
      persistDb(database);
      return true;
    }
    return false;
  },

  // Budget Allocation
  addBudgetItem(eventId: string, item: Omit<BudgetItem, "id">): BudgetItem | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const newItem: BudgetItem = sanitizeObject({
      ...item,
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    });

    event.budgetAllocations.push(newItem);
    this.updateEvent(eventId, { budgetAllocations: event.budgetAllocations });
    return newItem;
  },

  updateBudgetItem(eventId: string, itemId: string, updates: Partial<BudgetItem>): BudgetItem | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const index = event.budgetAllocations.findIndex((b) => b.id === itemId);
    if (index === -1) return null;

    event.budgetAllocations[index] = sanitizeObject({
      ...event.budgetAllocations[index],
      ...updates,
      id: itemId,
    });

    this.updateEvent(eventId, { budgetAllocations: event.budgetAllocations });
    return event.budgetAllocations[index];
  },

  deleteBudgetItem(eventId: string, itemId: string): boolean {
    const event = this.getEventById(eventId);
    if (!event) return false;

    const initialLen = event.budgetAllocations.length;
    event.budgetAllocations = event.budgetAllocations.filter((b) => b.id !== itemId);

    if (event.budgetAllocations.length !== initialLen) {
      this.updateEvent(eventId, { budgetAllocations: event.budgetAllocations });
      return true;
    }
    return false;
  },

  // Expenses
  addExpense(eventId: string, expense: Omit<Expense, "id">): Expense | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const newExpense: Expense = sanitizeObject({
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    });

    event.expenses.push(newExpense);

    // Also update spentAmount in corresponding budgetAllocation if exists
    const matchingAlloc = event.budgetAllocations.find((b) => b.category === expense.category);
    if (matchingAlloc && expense.paid) {
      matchingAlloc.spentAmount += expense.amount;
    }

    this.updateEvent(eventId, {
      expenses: event.expenses,
      budgetAllocations: event.budgetAllocations,
    });
    return newExpense;
  },

  updateExpense(eventId: string, expenseId: string, updates: Partial<Expense>): Expense | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const index = event.expenses.findIndex((e) => e.id === expenseId);
    if (index === -1) return null;

    event.expenses[index] = sanitizeObject({
      ...event.expenses[index],
      ...updates,
      id: expenseId,
    });

    // Recalculate spent amounts for all budget items
    const categoryTotals: Record<string, number> = {};
    for (const exp of event.expenses) {
      if (exp.paid) {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      }
    }
    for (const b of event.budgetAllocations) {
      if (categoryTotals[b.category] !== undefined) {
        b.spentAmount = categoryTotals[b.category];
      }
    }

    this.updateEvent(eventId, {
      expenses: event.expenses,
      budgetAllocations: event.budgetAllocations,
    });
    return event.expenses[index];
  },

  deleteExpense(eventId: string, expenseId: string): boolean {
    const event = this.getEventById(eventId);
    if (!event) return false;

    event.expenses = event.expenses.filter((e) => e.id !== expenseId);
    this.updateEvent(eventId, { expenses: event.expenses });
    return true;
  },

  // Milestones
  addMilestone(eventId: string, milestone: Omit<Milestone, "id">): Milestone | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const newMilestone: Milestone = sanitizeObject({
      ...milestone,
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    });

    event.milestones.push(newMilestone);
    this.updateEvent(eventId, { milestones: event.milestones });
    return newMilestone;
  },

  updateMilestone(eventId: string, milestoneId: string, updates: Partial<Milestone>): Milestone | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const index = event.milestones.findIndex((m) => m.id === milestoneId);
    if (index === -1) return null;

    event.milestones[index] = sanitizeObject({
      ...event.milestones[index],
      ...updates,
      id: milestoneId,
    });

    this.updateEvent(eventId, { milestones: event.milestones });
    return event.milestones[index];
  },

  deleteMilestone(eventId: string, milestoneId: string): boolean {
    const event = this.getEventById(eventId);
    if (!event) return false;

    event.milestones = event.milestones.filter((m) => m.id !== milestoneId);
    this.updateEvent(eventId, { milestones: event.milestones });
    return true;
  },

  // Run of Show
  addRunOfShowItem(eventId: string, item: Omit<RunOfShowItem, "id">): RunOfShowItem | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const newItem: RunOfShowItem = sanitizeObject({
      ...item,
      id: `ros-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    });

    event.runOfShow.push(newItem);
    this.updateEvent(eventId, { runOfShow: event.runOfShow });
    return newItem;
  },

  updateRunOfShowItem(eventId: string, itemId: string, updates: Partial<RunOfShowItem>): RunOfShowItem | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const index = event.runOfShow.findIndex((r) => r.id === itemId);
    if (index === -1) return null;

    event.runOfShow[index] = sanitizeObject({
      ...event.runOfShow[index],
      ...updates,
      id: itemId,
    });

    this.updateEvent(eventId, { runOfShow: event.runOfShow });
    return event.runOfShow[index];
  },

  deleteRunOfShowItem(eventId: string, itemId: string): boolean {
    const event = this.getEventById(eventId);
    if (!event) return false;

    event.runOfShow = event.runOfShow.filter((r) => r.id !== itemId);
    this.updateEvent(eventId, { runOfShow: event.runOfShow });
    return true;
  },

  // Vendors
  addVendor(eventId: string, vendor: Omit<Vendor, "id">): Vendor | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const newVendor: Vendor = sanitizeObject({
      ...vendor,
      id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    });

    event.vendors.push(newVendor);
    this.updateEvent(eventId, { vendors: event.vendors });
    return newVendor;
  },

  updateVendor(eventId: string, vendorId: string, updates: Partial<Vendor>): Vendor | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const index = event.vendors.findIndex((v) => v.id === vendorId);
    if (index === -1) return null;

    event.vendors[index] = sanitizeObject({
      ...event.vendors[index],
      ...updates,
      id: vendorId,
    });

    this.updateEvent(eventId, { vendors: event.vendors });
    return event.vendors[index];
  },

  deleteVendor(eventId: string, vendorId: string): boolean {
    const event = this.getEventById(eventId);
    if (!event) return false;

    event.vendors = event.vendors.filter((v) => v.id !== vendorId);
    this.updateEvent(eventId, { vendors: event.vendors });
    return true;
  },

  // Guests
  addGuest(eventId: string, guest: Omit<Guest, "id">): Guest | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const newGuest: Guest = sanitizeObject({
      ...guest,
      id: `g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    });

    event.guests.push(newGuest);
    this.updateEvent(eventId, { guests: event.guests });
    return newGuest;
  },

  updateGuest(eventId: string, guestId: string, updates: Partial<Guest>): Guest | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const index = event.guests.findIndex((g) => g.id === guestId);
    if (index === -1) return null;

    event.guests[index] = sanitizeObject({
      ...event.guests[index],
      ...updates,
      id: guestId,
    });

    this.updateEvent(eventId, { guests: event.guests });
    return event.guests[index];
  },

  deleteGuest(eventId: string, guestId: string): boolean {
    const event = this.getEventById(eventId);
    if (!event) return false;

    event.guests = event.guests.filter((g) => g.id !== guestId);
    this.updateEvent(eventId, { guests: event.guests });
    return true;
  },

  // Chat
  addChatMessage(eventId: string, message: Omit<ChatMessage, "id" | "timestamp">): ChatMessage | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const newMessage: ChatMessage = sanitizeObject({
      ...message,
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    });

    event.chatHistory.push(newMessage);
    this.updateEvent(eventId, { chatHistory: event.chatHistory });
    return newMessage;
  },

  // Settings
  getSettings(): PlanoraDatabase["userSettings"] {
    const database = getDb();
    return database.userSettings;
  },

  updateSettings(settings: Partial<PlanoraDatabase["userSettings"]>): PlanoraDatabase["userSettings"] {
    const database = getDb();
    database.userSettings = sanitizeObject({
      ...database.userSettings,
      ...settings,
    });
    persistDb(database);
    return database.userSettings;
  },

  // Audit Logs
  getAuditLogs(): PlanoraDatabase["auditLogs"] {
    const database = getDb();
    return database.auditLogs;
  },

  // Reset database to seed
  resetToSeed(): void {
    persistDb(JSON.parse(JSON.stringify(SEED_DATA)));
  },
};
