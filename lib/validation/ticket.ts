import { z } from "zod";

export const ticketSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required"),
  description: z.string().trim().min(1, "Description is required"),
  clientId: z.string().trim().min(1, "Client is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  category: z.enum(["HARDWARE", "SOFTWARE", "NETWORK", "ACCOUNT", "OTHER"]),
  assigneeId: z.string().trim().optional().or(z.literal("")),
});

export type TicketInput = z.infer<typeof ticketSchema>;

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty"),
});
