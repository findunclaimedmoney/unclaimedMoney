export * from "./generated/api";
export * from "./generated/types";

import { z } from "zod";

export const MiaChatBody = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
});
export type MiaChatBody = z.infer<typeof MiaChatBody>;

export const AlertsSubscribeBody = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  state: z.string().optional(),
});
export type AlertsSubscribeBody = z.infer<typeof AlertsSubscribeBody>;

export const SearchSubmitBody = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  state: z.string().optional(),
  birthYear: z.number().int().optional(),
});
export type SearchSubmitBody = z.infer<typeof SearchSubmitBody>;

export const FinanceEnquiryBody = z.object({
  loanType: z.string(),
  loanAmount: z.number().int(),
  preferredTerm: z.number().int(),
  estimatedMonthly: z.number().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  postcode: z.string().min(4).max(4),
  message: z.string().optional(),
});
export type FinanceEnquiryBody = z.infer<typeof FinanceEnquiryBody>;
