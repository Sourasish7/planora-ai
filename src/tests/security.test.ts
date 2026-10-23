import test from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeInput,
  sanitizeObject,
  checkRateLimit,
  EventPlanInputSchema,
} from "@/lib/security";

test("Security: sanitizeInput strips harmful script and HTML tags", () => {
  const malicious1 = '<script>alert("XSS")</script>Hello World';
  assert.equal(sanitizeInput(malicious1), "Hello World");

  const malicious2 = '<img src=x onerror="alert(1)">Party Time';
  assert.equal(sanitizeInput(malicious2), "Party Time");

  const malicious3 = "javascript:evil()";
  assert.equal(sanitizeInput(malicious3), "evil()");
});

test("Security: sanitizeObject recursively strips strings and arrays", () => {
  const input = {
    title: "<b>Grand Wedding</b>",
    budget: 5000,
    nested: {
      notes: "<script>hack()</script>Special Notes",
    },
    list: ["<i>Item 1</i>", "Item 2"],
  };

  const clean = sanitizeObject(input);
  assert.equal(clean.title, "Grand Wedding");
  assert.equal(clean.nested.notes, "Special Notes");
  assert.equal(clean.list[0], "Item 1");
  assert.equal(clean.budget, 5000);
});

test("Security: checkRateLimit restricts excessive requests", () => {
  const testIp = `test-ip-${Date.now()}`;
  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(testIp, 5, 10000);
    assert.equal(res.allowed, true);
  }
  const blocked = checkRateLimit(testIp, 5, 10000);
  assert.equal(blocked.allowed, false);
});

test("Security: EventPlanInputSchema enforces valid data boundaries", () => {
  const valid = {
    title: "Birthday Bash",
    eventType: "birthday",
    guestCount: 50,
    budget: 3000,
    currency: "USD",
  };
  const parsed = EventPlanInputSchema.safeParse(valid);
  assert.equal(parsed.success, true);

  const invalid = {
    title: "A", // too short (< 2)
    eventType: "invalid_type",
    guestCount: -5,
    budget: -100,
  };
  const failed = EventPlanInputSchema.safeParse(invalid);
  assert.equal(failed.success, false);

  // Valid with optional fields like specialRequests, stylePreferences, and currency
  const detailedValid = {
    title: "Eco-Friendly Community Fair",
    eventType: "community_event",
    guestCount: 200,
    budget: 15000,
    currency: "EUR",
    location: "City Park Amphitheater",
    stylePreferences: "Rustic & Biodegradable",
    specialRequests: "Outdoor event with solar lighting and vegan catering",
  };
  const detailedParsed = EventPlanInputSchema.safeParse(detailedValid);
  assert.equal(detailedParsed.success, true);
  if (detailedParsed.success) {
    assert.equal(detailedParsed.data.currency, "EUR");
    assert.equal(detailedParsed.data.guestCount, 200);
    assert.ok(detailedParsed.data.specialRequests?.includes("solar lighting"));
  }
});

test("Security: sanitizeObject safely handles null, undefined, and primitive types", () => {
  assert.equal(sanitizeObject(null), null);
  assert.equal(sanitizeObject(undefined), undefined);
  assert.equal(sanitizeObject(42), 42);
  assert.equal(sanitizeObject(true), true);
  assert.equal(sanitizeObject("  <script>evil()</script>Clean Text  "), "Clean Text");
});

