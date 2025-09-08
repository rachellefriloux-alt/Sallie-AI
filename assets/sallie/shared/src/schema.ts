/*
 * Persona: Tough love meets soul care.
 * Module: schema
 * Intent: Define Zod schemas for data validation
 * Provenance-ID: 7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

import { z } from "zod";

// User schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  firebaseUid: z.string().optional(),
  permissions: z.object({
    fullAccess: z.boolean(),
    memory: z.boolean(),
    creativity: z.boolean(),
    deviceControl: z.boolean(),
    notifications: z.boolean(),
    analytics: z.boolean(),
  }).optional(),
  profile: z.object({
    name: z.string(),
    avatar: z.string().optional(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  firebaseUid: z.string().optional(),
  permissions: z.object({
    fullAccess: z.boolean(),
    memory: z.boolean(),
    creativity: z.boolean(),
    deviceControl: z.boolean(),
    notifications: z.boolean(),
    analytics: z.boolean(),
  }).optional(),
  profile: z.object({
    name: z.string(),
    avatar: z.string().optional(),
  }).optional(),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Conversation schema
export const conversationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertConversationSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
});

export type Conversation = z.infer<typeof conversationSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

// Task schema
export const taskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  conversationId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertTaskSchema = z.object({
  userId: z.string(),
  conversationId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
});

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Memory schema
export const memorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  conversationId: z.string(),
  content: z.string(),
  type: z.enum(["user_message", "ai_response", "system_note"]),
  createdAt: z.date(),
});

export const insertMemorySchema = z.object({
  userId: z.string(),
  conversationId: z.string(),
  content: z.string().min(1),
  type: z.enum(["user_message", "ai_response", "system_note"]),
});

export type Memory = z.infer<typeof memorySchema>;
export type InsertMemory = z.infer<typeof insertMemorySchema>;

// Persona State schema
export const personaStateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  personaId: z.string(),
  state: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertPersonaStateSchema = z.object({
  userId: z.string(),
  personaId: z.string(),
  state: z.record(z.any()).default({}),
});

export type PersonaState = z.infer<typeof personaStateSchema>;
export type InsertPersonaState = z.infer<typeof insertPersonaStateSchema>;
