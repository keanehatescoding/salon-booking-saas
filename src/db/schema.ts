import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "succeeded", "failed", "refunded"]);
export const paymentChannelEnum = pgEnum("payment_channel", ["mpesa", "card", "cash"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_lower_idx").on(sql`lower(${t.email})`)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  phone: text("phone").notNull(),
  neighbourhood: text("neighbourhood").notNull(),
  mpesaTill: text("mpesa_till"),
  // Minimum deposit required to confirm a booking, in KES. Zero disables deposits.
  depositKes: integer("deposit_kes").notNull().default(0),
  ...timestamps,
});

export const businessSlugIdx = uniqueIndex("businesses_slug_idx").on(businesses.slug);

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    priceKes: integer("price_kes").notNull(),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("services_business_idx").on(t.businessId)],
);

export const staff = pgTable(
  "staff",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    phone: text("phone"),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("staff_business_idx").on(t.businessId)],
);

/** Clients are keyed by phone within a business — walk-ins don't need an account. */
export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    notes: text("notes").notNull().default(""),
    ...timestamps,
  },
  (t) => [uniqueIndex("clients_business_phone_idx").on(t.businessId, t.phone)],
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "restrict" }),
    staffId: uuid("staff_id").references(() => staff.id, { onDelete: "set null" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: bookingStatusEnum("status").notNull().default("pending"),
    priceKes: integer("price_kes").notNull(),
    notes: text("notes").notNull().default(""),
    reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("bookings_business_starts_idx").on(t.businessId, t.startsAt),
    index("bookings_staff_starts_idx").on(t.staffId, t.startsAt),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    channel: paymentChannelEnum("channel").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    amountKes: integer("amount_kes").notNull(),
    // Daraja checkout request ID (STK push) or merchant request ID.
    mpesaReference: text("mpesa_reference"),
    mpesaReceipt: text("mpesa_receipt"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("payments_mpesa_reference_idx").on(t.mpesaReference), index("payments_booking_idx").on(t.bookingId)],
);

export const businessRelations = relations(businesses, ({ many, one }) => ({
  owner: one(users, { fields: [businesses.ownerId], references: [users.id] }),
  services: many(services),
  staff: many(staff),
  bookings: many(bookings),
}));

export const bookingRelations = relations(bookings, ({ one, many }) => ({
  business: one(businesses, { fields: [bookings.businessId], references: [businesses.id] }),
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
  staff: one(staff, { fields: [bookings.staffId], references: [staff.id] }),
  client: one(clients, { fields: [bookings.clientId], references: [clients.id] }),
  payments: many(payments),
}));

export type User = typeof users.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Payment = typeof payments.$inferSelect;
