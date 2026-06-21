import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const emailAlertsTable = pgTable("email_alerts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  state: text("state"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEmailAlertSchema = createInsertSchema(emailAlertsTable).omit({ id: true, createdAt: true });
export type InsertEmailAlert = z.infer<typeof insertEmailAlertSchema>;
export type EmailAlert = typeof emailAlertsTable.$inferSelect;

export const searchSubmissionsTable = pgTable("search_submissions", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  state: text("state"),
  birthYear: integer("birth_year"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSearchSubmissionSchema = createInsertSchema(searchSubmissionsTable).omit({ id: true, createdAt: true });
export type InsertSearchSubmission = z.infer<typeof insertSearchSubmissionSchema>;
export type SearchSubmission = typeof searchSubmissionsTable.$inferSelect;

export const financeEnquiriesTable = pgTable("finance_enquiries", {
  id: serial("id").primaryKey(),
  loanType: text("loan_type").notNull(),
  loanAmount: integer("loan_amount").notNull(),
  preferredTerm: integer("preferred_term").notNull(),
  estimatedMonthly: integer("estimated_monthly"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  postcode: text("postcode").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFinanceEnquirySchema = createInsertSchema(financeEnquiriesTable).omit({ id: true, createdAt: true });
export type InsertFinanceEnquiry = z.infer<typeof insertFinanceEnquirySchema>;
export type FinanceEnquiry = typeof financeEnquiriesTable.$inferSelect;
