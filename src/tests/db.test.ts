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

  // Update
  const updated = db.updateEvent(newEvt.id, { title: "Updated Test Event" });
  assert.equal(updated?.title, "Updated Test Event");

  // Delete
  const deleted = db.deleteEvent(newEvt.id);
  assert.equal(deleted, true);
  assert.equal(db.getEventById(newEvt.id), null);
});
