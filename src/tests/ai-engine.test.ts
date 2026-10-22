import test from "node:test";
import assert from "node:assert/strict";
import { generateAutonomousPlan, processAIChat } from "@/lib/ai-engine";
import { EventPlan } from "@/types";

test("AI Engine: generateAutonomousPlan generates complete blueprints for weddings", () => {
  const plan = generateAutonomousPlan({
    title: "Sophia & Liam's Sunset Wedding",
    eventType: "wedding",
    budget: 40000,
    guestCount: 150,
    currency: "USD",
  });

  assert.equal(plan.title, "Sophia & Liam's Sunset Wedding");
  assert.equal(plan.eventType, "wedding");
  assert.equal(plan.totalBudget, 40000);
  assert.equal(plan.guestCount, 150);

  // Check budget allocations
  assert.ok(plan.budgetAllocations.length >= 5);
  const totalAlloc = plan.budgetAllocations.reduce(
    (sum, b) => sum + b.allocatedAmount,
    0
  );
  assert.ok(Math.abs(totalAlloc - 40000) < 50);

  // Check milestones & run of show
  assert.ok(plan.milestones.length >= 5);
  assert.ok(plan.runOfShow.length >= 6);

  // Check vendors & ideas
  assert.ok(plan.vendors.length >= 4);
  assert.ok(plan.ideas.themes.length >= 1);
  assert.ok(plan.ideas.activities.length >= 1);
  assert.ok(plan.ideas.menus.length >= 1);
  assert.ok(plan.ideas.invitationTemplates.length >= 1);
});

test("AI Engine: generateAutonomousPlan generates blueprints for community events", () => {
  const plan = generateAutonomousPlan({
    title: "Westwood Harvest Carnival",
    eventType: "community_event",
    budget: 12000,
    guestCount: 500,
    currency: "USD",
  });

  assert.equal(plan.eventType, "community_event");
  assert.equal(plan.guestCount, 500);
  assert.ok(plan.budgetAllocations.some((b) => b.category.includes("Permits")));
  assert.ok(plan.runOfShow.length >= 5);
});

test("AI Engine: processAIChat responds with budget guidance", async () => {
  const mockEvent: EventPlan = {
    id: "test-01",
    title: "Test Gala",
    eventType: "wedding",
    theme: "Gold & White",
    date: "2026-12-01",
    location: "City Hall",
    guestCount: 100,
    currency: "USD",
    totalBudget: 20000,
    budgetAllocations: [
      { id: "b-1", category: "Venue", allocatedAmount: 8000, spentAmount: 0 },
    ],
    expenses: [
      {
        id: "e-1",
        title: "Deposit",
        category: "Venue",
        amount: 4000,
        paid: true,
      },
    ],
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
    createdAt: "",
    updatedAt: "",
  };

  const response = await processAIChat(mockEvent, "How can I cut budget costs?");
  assert.ok(response.content.toLowerCase().includes("budget"));
  assert.ok(response.content.includes("20,000"));
});
