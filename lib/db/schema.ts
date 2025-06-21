import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  numeric,
  json,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['fan', 'artist', 'venue', 'admin']);
export const eventStatusEnum = pgEnum('event_status', ['draft', 'published', 'cancelled', 'completed']);
export const ticketStatusEnum = pgEnum('ticket_status', ['available', 'sold', 'reserved', 'used', 'refunded']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'accepted', 'rejected', 'completed', 'cancelled']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('fan'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  stripeCustomerId: text('stripe_customer_id').unique(),
  fanPreferences: json('fan_preferences'),
});

// Activity logs table
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: integer('entity_id').notNull(),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
  metadata: json('metadata'),
});

// Artists table
export const artists = pgTable('artists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  stageName: varchar('stage_name', { length: 100 }).notNull(),
  bio: text('bio'),
  genres: json('genres'),
  socialLinks: json('social_links'),
  stripeAccountId: text('stripe_account_id'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Venues table
export const venues = pgTable('venues', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 50 }),
  country: varchar('country', { length: 50 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
  capacity: integer('capacity').notNull(),
  amenities: json('amenities'),
  photos: json('photos'),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  stripeAccountId: text('stripe_account_id'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Events table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').notNull().references(() => artists.id),
  venueId: integer('venue_id').references(() => venues.id),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  eventDate: timestamp('event_date').notNull(),
  doorTime: timestamp('door_time'),
  endTime: timestamp('end_time'),
  status: eventStatusEnum('status').notNull().default('draft'),
  ticketPrice: numeric('ticket_price', { precision: 10, scale: 2 }),
  ticketCapacity: integer('ticket_capacity'),
  ticketsSold: integer('tickets_sold').default(0),
  platformFeePercent: numeric('platform_fee_percent', { precision: 5, scale: 2 }).default('5.00'),
  resalePolicy: json('resale_policy'),
  ageRestriction: varchar('age_restriction', { length: 10 }),
  genres: json('genres'),
  coverImage: text('cover_image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tickets table
export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  originalBuyerId: integer('original_buyer_id').notNull().references(() => users.id),
  ticketNumber: varchar('ticket_number', { length: 50 }).notNull().unique(),
  qrCode: text('qr_code').notNull(),
  purchasePrice: numeric('purchase_price', { precision: 10, scale: 2 }).notNull(),
  platformFee: numeric('platform_fee', { precision: 10, scale: 2 }).notNull(),
  status: ticketStatusEnum('status').notNull().default('sold'),
  transferredAt: timestamp('transferred_at'),
  usedAt: timestamp('used_at'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Booking requests table
export const bookingRequests = pgTable('booking_requests', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').notNull().references(() => artists.id),
  venueId: integer('venue_id').notNull().references(() => venues.id),
  proposedDate: timestamp('proposed_date').notNull(),
  proposedEndDate: timestamp('proposed_end_date'),
  proposedFee: numeric('proposed_fee', { precision: 10, scale: 2 }),
  message: text('message'),
  status: bookingStatusEnum('status').notNull().default('pending'),
  counterOfferFee: numeric('counter_offer_fee', { precision: 10, scale: 2 }),
  counterOfferMessage: text('counter_offer_message'),
  eventId: integer('event_id').references(() => events.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  reviewerId: integer('reviewer_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  artists: many(artists),
  venues: many(venues),
  tickets: many(tickets),
  originalTickets: many(tickets),
  reviews: many(reviews),
  activityLogs: many(activityLogs),
}));

export const artistsRelations = relations(artists, ({ one, many }) => ({
  user: one(users, {
    fields: [artists.userId],
    references: [users.id],
  }),
  events: many(events),
  bookingRequests: many(bookingRequests),
}));

export const venuesRelations = relations(venues, ({ one, many }) => ({
  user: one(users, {
    fields: [venues.userId],
    references: [users.id],
  }),
  events: many(events),
  bookingRequests: many(bookingRequests),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  artist: one(artists, {
    fields: [events.artistId],
    references: [artists.id],
  }),
  venue: one(venues, {
    fields: [events.venueId],
    references: [venues.id],
  }),
  tickets: many(tickets),
  reviews: many(reviews),
  bookingRequest: one(bookingRequests),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  event: one(events, {
    fields: [tickets.eventId],
    references: [events.id],
  }),
  owner: one(users, {
    fields: [tickets.ownerId],
    references: [users.id],
  }),
  originalBuyer: one(users, {
    fields: [tickets.originalBuyerId],
    references: [users.id],
  }),
}));

export const bookingRequestsRelations = relations(bookingRequests, ({ one }) => ({
  artist: one(artists, {
    fields: [bookingRequests.artistId],
    references: [artists.id],
  }),
  venue: one(venues, {
    fields: [bookingRequests.venueId],
    references: [venues.id],
  }),
  event: one(events, {
    fields: [bookingRequests.eventId],
    references: [events.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  event: one(events, {
    fields: [reviews.eventId],
    references: [events.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;
export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type NewBookingRequest = typeof bookingRequests.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

// Additional composite types
export type ArtistWithUser = Artist & {
  user: User;
};

export type VenueWithUser = Venue & {
  user: User;
};

export type EventWithDetails = Event & {
  artist: ArtistWithUser;
  venue?: Venue | null;
  tickets: Ticket[];
  reviews: Review[];
};

// Activity types enum
export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_EVENT = 'CREATE_EVENT',
  UPDATE_EVENT = 'UPDATE_EVENT',
  DELETE_EVENT = 'DELETE_EVENT',
  PURCHASE_TICKET = 'PURCHASE_TICKET',
  TRANSFER_TICKET = 'TRANSFER_TICKET',
  USE_TICKET = 'USE_TICKET',
  CREATE_BOOKING_REQUEST = 'CREATE_BOOKING_REQUEST',
  ACCEPT_BOOKING_REQUEST = 'ACCEPT_BOOKING_REQUEST',
  REJECT_BOOKING_REQUEST = 'REJECT_BOOKING_REQUEST',
  CREATE_REVIEW = 'CREATE_REVIEW',
}
