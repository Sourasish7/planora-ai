import { z } from "zod";

/**
 * Moderate Security Utilities
 * - Input sanitization against XSS
 * - Rate limiting helper for API calls
 * - Secure error payload masking
 */

/**
 * Strip potentially harmful HTML/JS injection from user text
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "") // strip all HTML tags
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

/**
 * Deep sanitize an object's string properties
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === "string") return sanitizeInput(obj) as unknown as T;
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }
  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "string") {
      sanitized[key] = sanitizeInput(val);
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = sanitizeObject(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized as T;
}

// In-memory token bucket rate limiter
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimits = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  ipOrIdentifier: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimits.get(ipOrIdentifier);

  if (!record || now > record.resetTime) {
    rateLimits.set(ipOrIdentifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Zod Validation Schemas
export const EventPlanInputSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  eventType: z.enum([
    "wedding",
    "birthday",
    "anniversary",
    "college_festival",
    "community_event",
    "corporate_social",
    "baby_shower",
    "cultural_gathering",
    "custom",
  ]),
  date: z.string().optional().default(""),
  location: z.string().max(120).optional().default(""),
  guestCount: z.number().int().min(1, "Guest count must be at least 1").max(50000),
  budget: z.number().min(0, "Budget must be non-negative").max(100000000),
  currency: z.string().max(10).optional().default("USD"),
  stylePreferences: z.string().max(500).optional().default(""),
  specialRequests: z.string().max(1000).optional().default(""),
  apiKey: z.string().max(200).optional(),
});

export const BudgetItemSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1),
  allocatedAmount: z.number().min(0),
  spentAmount: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export const ExpenseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(100),
  category: z.string().min(1),
  amount: z.number().min(0),
  paid: z.boolean().default(false),
  paidDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  vendorId: z.string().optional(),
  notes: z.string().optional(),
});

export const VendorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  category: z.string().min(1),
  status: z.enum([
    "researching",
    "contacted",
    "quote_received",
    "shortlisted",
    "booked",
    "completed",
  ]),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  quotedPrice: z.number().min(0).default(0),
  finalPrice: z.number().min(0).optional(),
  contractSigned: z.boolean().default(false),
  depositPaid: z.boolean().default(false),
  notes: z.string().optional(),
});

export const MilestoneSchema = z.object({
  id: z.string().optional(),
  timeframe: z.string().min(1),
  title: z.string().min(1).max(150),
  description: z.string().default(""),
  completed: z.boolean().default(false),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
});

export const RunOfShowItemSchema = z.object({
  id: z.string().optional(),
  time: z.string().min(1),
  activity: z.string().min(1).max(150),
  personInCharge: z.string().default(""),
  location: z.string().default(""),
  status: z.enum(["upcoming", "in_progress", "completed"]).default("upcoming"),
  notes: z.string().optional(),
});

export const GuestSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  email: z.string().optional(),
  phone: z.string().optional(),
  rsvpStatus: z.enum(["attending", "declined", "pending"]).default("pending"),
  plusOnes: z.number().int().min(0).default(0),
  dietary: z.string().default("Standard"),
  tableAssignment: z.string().optional(),
  invitationSent: z.boolean().default(false),
});
