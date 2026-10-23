import test from "node:test";
import assert from "node:assert/strict";
import { db } from "@/lib/db";

test("Database: can retrieve all events", () => {
  const events = db.getAllEvents();
  assert.ok(Array.isArray(events));
});

test("Database: can create, read, update, and delete an event", () => {
  const newEvt = db.createEvent({
    title: "Test Unit Event",
    eventType: "birthday",
    theme: "Blue",
    date: "2026-10-30",
    location: "Test Location",
    guestCount: 30,
    currency: "USD",
    totalBudget: 2500,
    budgetAllocations: [],
    expenses: [],
    milestones: [],
    runOfShow: [],
    vendors: [],
    ideas: {
      themes: [],
      activities: [],
      menus: [],
      invitationTemplates: [],
      musicPlaylists: [],
    },
    guests: [],
    chatHistory: [],
  });

  assert.ok(newEvt.id);
  assert.equal(newEvt.title, "Test Unit Event");

  // Read
  const found = db.getEventById(newEvt.id);
  assert.ok(found);
  assert.equal(found.title, "Test Unit Event");

  // Sub-item CRUD: Add budget item
  const budgetItem = db.addBudgetItem(newEvt.id, {
    category: "Catering",
    allocatedAmount: 1200,
    spentAmount: 0,
    notes: "Food and drinks",
  });
  assert.ok(budgetItem);
  assert.equal(budgetItem.category, "Catering");
  assert.equal(budgetItem.allocatedAmount, 1200);

  // Sub-item CRUD: Add expense
  const expense = db.addExpense(newEvt.id, {
    title: "Deposit for cake",
    category: "Catering",
    amount: 150,
    paid: true,
    paidDate: "2026-10-25",
  });
  assert.ok(expense);
  assert.equal(expense.amount, 150);
  assert.equal(expense.paid, true);

  // Sub-item CRUD: Add and update guest
  const guest = db.addGuest(newEvt.id, {
    name: "John Doe",
    email: "john@example.com",
    rsvpStatus: "attending",
    dietary: "Vegetarian",
    plusOnes: 1,
    invitationSent: true,
  });
  assert.ok(guest);
  assert.equal(guest.name, "John Doe");
  assert.equal(guest.plusOnes, 1);

  // Update
  const updated = db.updateEvent(newEvt.id, { title: "Updated Test Event" });
  assert.equal(updated?.title, "Updated Test Event");

  // Verify Audit Logs exist
  const logs = db.getAuditLogs();
  assert.ok(logs.length > 0);
  assert.ok(logs.some((l: { action: string; details: string }) => l.action === "CREATE_EVENT" && l.details.includes("Test Unit Event")));

  // Delete
  const deleted = db.deleteEvent(newEvt.id);
  assert.equal(deleted, true);
  assert.equal(db.getEventById(newEvt.id), null);
});

test("Database: settings can be retrieved and updated safely", () => {
  const initialSettings = db.getSettings();
  assert.ok(initialSettings);
  assert.ok(["auto", "gemini", "openai"].includes(initialSettings.aiProvider));

  const updated = db.updateSettings({
    preferredCurrency: "EUR",
    aiProvider: "auto",
  });
  assert.equal(updated.preferredCurrency, "EUR");

  // Revert back
  db.updateSettings({
    preferredCurrency: initialSettings.preferredCurrency,
    aiProvider: initialSettings.aiProvider,
  });
});

