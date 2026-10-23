import test from "node:test";
import assert from "node:assert/strict";
import { generateAutonomousPlan, processAIChat, getBudgetTier, getDecorationsForEvent } from "@/lib/ai-engine";
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

test("AI Engine: processAIChat accepts custom Gemini and OpenAI models and falls back cleanly", async () => {
  const mockEvent: EventPlan = {
    id: "test-02",
    title: "Launch Party",
    eventType: "corporate_social",
    theme: "Modern Tech",
    date: "2026-11-15",
    location: "Hub",
    guestCount: 80,
    currency: "USD",
    totalBudget: 15000,
    budgetAllocations: [],
    expenses: [],
    milestones: [],
    runOfShow: [],
    vendors: [],
    ideas: { themes: [], activities: [], menus: [], invitationTemplates: [], musicPlaylists: [] },
    guests: [],
    chatHistory: [],
    createdAt: "",
    updatedAt: "",
  };

  // Test custom Gemini model fallback
  const geminiRes = await processAIChat(mockEvent, "What games should we play?", "mock-key", "gemini", "gemini-2.0-flash");
  assert.ok(geminiRes.content.length > 0);

  // Test custom OpenAI model fallback
  const openaiRes = await processAIChat(mockEvent, "Draft an invitation email", "sk-mock-key", "openai", "gpt-4o");
  assert.ok(openaiRes.content.length > 0);
});

test("AI Engine: processAIChat generates full speech for 'can you tell me speach regarding my birthday'", async () => {
  const mockBirthday: EventPlan = {
    id: "evt-bday",
    title: "Sourasish Birthday",
    eventType: "birthday",
    theme: "Electric Neon Arcade & Disco Retro",
    date: "2026-10-23",
    location: "Science College, Kokrajhar",
    guestCount: 10,
    currency: "USD",
    totalBudget: 500,
    budgetAllocations: [],
    expenses: [],
    milestones: [],
    runOfShow: [],
    vendors: [],
    ideas: { themes: [], activities: [], menus: [], invitationTemplates: [], musicPlaylists: [] },
    guests: [],
    chatHistory: [],
    createdAt: "",
    updatedAt: "",
  };

  const response = await processAIChat(mockBirthday, "can you tell me speach regarding my birthday");
  assert.ok(response.content.includes("Birthday Toast"));
  assert.ok(response.content.includes("Sourasish"));
  assert.ok(response.content.includes("Science College, Kokrajhar"));
  assert.ok(response.content.includes("10"));
  assert.ok(response.suggestedActions?.some(a => a.label.includes("Speeches")));
});

test("AI Engine: generateAutonomousPlan personalizes diet, location, and speeches per user inputs", () => {
  const plan = generateAutonomousPlan({
    title: "Sourasish Birthday",
    eventType: "birthday",
    budget: 500,
    guestCount: 10,
    currency: "USD",
    location: "Science College, Kokrajhar",
    specialRequests: "Special notes: Veg Only",
  });

  // Verify vegetarian menu substitution
  assert.ok(plan.ideas.menus.length > 0);
  const menuItems = plan.ideas.menus[0].items.join(" ");
  assert.ok(menuItems.includes("Paneer") || menuItems.includes("Mushroom") || menuItems.includes("Vegetarian"));
  assert.ok(!menuItems.includes("Angus Beef"));

  // Verify location-adapted vendors
  assert.ok(plan.vendors.length > 0);
  assert.ok(plan.vendors[0].name.includes("Science College"));

  // Verify tailored speeches generated
  assert.ok(plan.ideas.speeches && plan.ideas.speeches.length >= 3);
  const firstSpeech = plan.ideas.speeches[0];
  assert.ok(firstSpeech.speechText.includes("Sourasish Birthday"));
  assert.ok(firstSpeech.speechText.includes("Science College, Kokrajhar"));
});

test("AI Engine: getBudgetTier correctly categorizes budgets by currency and purchasing power", () => {
  assert.equal(getBudgetTier(100, "INR"), "pocket");
  assert.equal(getBudgetTier(200, "INR"), "pocket");
  assert.equal(getBudgetTier(1000, "INR"), "micro");
  assert.equal(getBudgetTier(5000, "INR"), "budget");
  assert.equal(getBudgetTier(25000, "INR"), "moderate");
  assert.equal(getBudgetTier(100000, "INR"), "premium");

  assert.equal(getBudgetTier(3, "USD"), "pocket");
  assert.equal(getBudgetTier(20, "USD"), "micro");
  assert.equal(getBudgetTier(100, "USD"), "budget");
  assert.equal(getBudgetTier(500, "USD"), "moderate");
  assert.equal(getBudgetTier(5000, "USD"), "premium");
});

test("AI Engine: generateAutonomousPlan preserves small budgets (e.g. 200 INR, 4 guests) without clamping to 500/10", () => {
  const plan = generateAutonomousPlan({
    title: "Small Birthday Celebration",
    eventType: "birthday",
    budget: 200,
    guestCount: 4,
    currency: "INR",
  });

  // Verify inputs are NOT clamped
  assert.equal(plan.totalBudget, 200);
  assert.equal(plan.guestCount, 4);
  assert.equal(plan.currency, "INR");

  // Verify decoration items are scaled realistically for a 200 INR pocket gathering
  assert.ok(plan.ideas.themes.length > 0);
  const decorations = plan.ideas.themes[0].decorations;
  assert.ok(decorations && decorations.length >= 2);

  const decorText = decorations.join(" ").toLowerCase();
  // Should include affordable essentials Balloons, Candles
  assert.ok(decorText.includes("balloon"));
  assert.ok(decorText.includes("candle"));
  // Must NOT include luxury items
  assert.ok(!decorText.includes("chiavari"));
  assert.ok(!decorText.includes("candelabra"));
  assert.ok(!decorText.includes("brass ceremony arch"));
  assert.ok(!decorText.includes("monogram dance floor"));
});

test("AI Engine: generateAutonomousPlan for weddings with low budget gives pocket decorations instead of luxury arch", () => {
  const plan = generateAutonomousPlan({
    title: "Intimate Courthouse Reception",
    eventType: "wedding",
    budget: 200,
    guestCount: 4,
    currency: "INR",
  });

  assert.equal(plan.totalBudget, 200);
  assert.equal(plan.guestCount, 4);

  const decorations = plan.ideas.themes[0].decorations;
  assert.ok(decorations && decorations.length > 0);
  const decorText = decorations.join(" ").toLowerCase();

  assert.ok(decorText.includes("flower") || decorText.includes("candle"));
  assert.ok(!decorText.includes("brass ceremony arch"));
  assert.ok(!decorText.includes("chiavari chairs"));
  assert.ok(!decorText.includes("crystal candelabras"));
});

test("AI Engine: getDecorationsForEvent scales supplies strictly per budget tier with simple names", () => {
  const pocketDecor = getDecorationsForEvent("birthday", "pocket");
  const microDecor = getDecorationsForEvent("birthday", "micro");
  const budgetDecor = getDecorationsForEvent("birthday", "budget");
  const moderateDecor = getDecorationsForEvent("birthday", "moderate");
  const premiumDecor = getDecorationsForEvent("birthday", "premium");

  // Verify item counts increase strictly with budget tier
  assert.equal(pocketDecor.length, 2);
  assert.equal(microDecor.length, 4);
  assert.equal(budgetDecor.length, 8);
  assert.equal(moderateDecor.length, 10);
  assert.equal(premiumDecor.length, 12);

  // All must be simple names
  assert.ok(pocketDecor.includes("Balloons"));
  assert.ok(pocketDecor.includes("Candles"));

  assert.ok(microDecor.includes("Balloons"));
  assert.ok(microDecor.includes("Cake"));
  assert.ok(microDecor.includes("Candles"));
  assert.ok(microDecor.includes("Birthday Banner"));

  // Higher tiers have additional supplies
  assert.ok(budgetDecor.includes("Fairy Lights"));
  assert.ok(budgetDecor.includes("Streamers"));
  assert.ok(moderateDecor.includes("Photo Props"));
  assert.ok(moderateDecor.includes("Flowers"));
  assert.ok(premiumDecor.includes("Table Runner"));
  assert.ok(premiumDecor.includes("Welcome Sign"));
});

test("AI Engine: 100 INR pocket budget gives 2 realistic essentials while 100 USD gives 8 complete party supplies", () => {
  const inrTier = getBudgetTier(100, "INR");
  const usdTier = getBudgetTier(100, "USD");

  assert.equal(inrTier, "pocket"); // 100 INR is ~$1.18 USD (pocket tier)
  assert.equal(usdTier, "budget"); // 100 USD is $100 USD (budget tier, ~85x more purchasing power)

  const inrItems = getDecorationsForEvent("birthday", inrTier);
  const usdItems = getDecorationsForEvent("birthday", usdTier);

  // 100 INR only gives realistic affordable essentials (Balloons, Candles) that cost ~₹50
  assert.equal(inrItems.length, 2);
  assert.deepEqual(inrItems, ["Balloons", "Candles"]);
  // Must NOT include full celebration cake or party poppers that cost more than 100 INR
  assert.ok(!inrItems.includes("Cake"));
  assert.ok(!inrItems.includes("Party Poppers"));
  assert.ok(!inrItems.includes("Birthday Banner"));

  // 100 USD gives 8 complete party supplies including Cake, Banner, Fairy Lights, etc.
  assert.equal(usdItems.length, 8);
  assert.ok(usdItems.includes("Cake"));
  assert.ok(usdItems.includes("Balloons"));
  assert.ok(usdItems.includes("Birthday Banner"));
  assert.ok(usdItems.includes("Party Poppers"));
  assert.ok(usdItems.includes("Party Hats"));
  assert.ok(usdItems.includes("Fairy Lights"));
  assert.ok(usdItems.includes("Streamers"));
});
