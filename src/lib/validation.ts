import { z } from "zod";

const text = (max = 200) => z.string().trim().min(1).max(max);

export const projectSchema = z.object({
  name: text(120),
  scenario: z.enum(["A", "B", "C"]),
  kind: z.enum(["hospital", "pmo"]),
});

export const riskSchema = z.object({
  title: text(200),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["open", "mitigating", "closed"]),
  owner: z.string().trim().max(80).optional(),
});

export const deliverableSchema = z.object({
  name: text(200),
  phase: z.number().int().min(1).max(6),
  status: z.enum(["not_started", "in_progress", "completed", "blocked"]),
  owner: z.string().trim().max(80).optional(),
  doc_url: z.string().url().optional(),
  remarks: z.string().trim().max(500).optional(),
});

export const baselineEntrySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  baseline: z.number().min(0),
  actual: z.number().min(0),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

export const totpCodeSchema = z.string().trim().regex(/^\d{6}$/);

export const dependencySchema = z.object({
  title: text(200),
  type: z.enum(["license", "dea", "340b", "payer", "accreditation", "other"]),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const todoSchema = z.object({
  title: text(200),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const meetingSchema = z.object({
  title: text(200),
  starts_at: z.string().datetime(),
});
