import { eq, desc, and, sql, or } from 'drizzle-orm';
import { db } from './drizzle';
import {
  users,
  artists,
  venues,
  events,
  tickets,
  bookingRequests,
  reviews,
  activityLogs,
  type User,
  type Artist,
  type Venue,
  type Event,
  type EventWithDetails,
  type ArtistWithUser,
  type VenueWithUser,
  type Ticket,
  type BookingRequest,
  type Review
} from './schema';
import { getSession } from '@/lib/auth/session';

export async function getUser(): Promise<User | null> {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return user || null;
}

export async function getUserById(id: number): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user || null;
}

export async function getArtistProfile(userId?: number): Promise<ArtistWithUser | null> {
  const targetUserId = userId || (await getSession())?.user?.id;
  if (!targetUserId) return null;

  const [artistProfile] = await db
    .select()
    .from(artists)
    .innerJoin(users, eq(artists.userId, users.id))
    .where(eq(artists.userId, targetUserId))
    .limit(1);

  if (!artistProfile) return null;

  return {
    ...artistProfile.artists,
    user: artistProfile.users
  };
}

export async function getVenueProfile(userId?: number): Promise<VenueWithUser | null> {
  const targetUserId = userId || (await getSession())?.user?.id;
  if (!targetUserId) return null;

  const [venueProfile] = await db
    .select()
    .from(venues)
    .innerJoin(users, eq(venues.userId, users.id))
    .where(eq(venues.userId, targetUserId))
    .limit(1);

  if (!venueProfile) return null;

  return {
    ...venueProfile.venues,
    user: venueProfile.users
  };
}

export async function getArtistEvents(artistId: number): Promise<Event[]> {
  return await db
    .select()
    .from(events)
    .where(eq(events.artistId, artistId))
    .orderBy(desc(events.eventDate));
}

export async function getVenueEvents(venueId: number): Promise<Event[]> {
  return await db
    .select()
    .from(events)
    .where(eq(events.venueId, venueId))
    .orderBy(desc(events.eventDate));
}

export async function getEventById(id: number): Promise<EventWithDetails | null> {
  const [eventData] = await db
    .select()
    .from(events)
    .innerJoin(artists, eq(events.artistId, artists.id))
    .innerJoin(users, eq(artists.userId, users.id))
    .leftJoin(venues, eq(events.venueId, venues.id))
    .where(eq(events.id, id))
    .limit(1);

  if (!eventData) return null;

  // Get tickets and reviews for this event
  const [eventTickets, eventReviews] = await Promise.all([
    db.select().from(tickets).where(eq(tickets.eventId, id)),
    db
      .select()
      .from(reviews)
      .innerJoin(users, eq(reviews.reviewerId, users.id))
      .where(eq(reviews.eventId, id))
      .orderBy(desc(reviews.createdAt))
  ]);

  return {
    ...eventData.events,
    artist: {
      ...eventData.artists,
      user: eventData.users
    },
    venue: eventData.venues || undefined,
    tickets: eventTickets,
    reviews: eventReviews.map(r => r.reviews)
  };
}

export async function getPublicEvents(limit = 20): Promise<EventWithDetails[]> {
  const eventData = await db
    .select()
    .from(events)
    .innerJoin(artists, eq(events.artistId, artists.id))
    .innerJoin(users, eq(artists.userId, users.id))
    .leftJoin(venues, eq(events.venueId, venues.id))
    .where(eq(events.status, 'published'))
    .orderBy(desc(events.eventDate))
    .limit(limit);

  return eventData.map(data => ({
    ...data.events,
    artist: {
      ...data.artists,
      user: data.users
    },
    venue: data.venues || undefined,
    tickets: [],
    reviews: []
  }));
}

export async function getUserTickets(userId?: number): Promise<Ticket[]> {
  const targetUserId = userId || (await getSession())?.user?.id;
  if (!targetUserId) return [];

  return await db
    .select()
    .from(tickets)
    .where(eq(tickets.ownerId, targetUserId))
    .orderBy(desc(tickets.createdAt));
}

export async function getTicketById(id: number): Promise<Ticket | null> {
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, id))
    .limit(1);

  return ticket || null;
}

export async function getBookingRequests(type: 'artist' | 'venue', userId?: number) {
  const targetUserId = userId || (await getSession())?.user?.id;
  if (!targetUserId) return [];

  if (type === 'artist') {
    const artistProfile = await getArtistProfile(targetUserId);
    if (!artistProfile) return [];

    const bookingData = await db
      .select()
      .from(bookingRequests)
      .innerJoin(venues, eq(bookingRequests.venueId, venues.id))
      .innerJoin(users, eq(venues.userId, users.id))
      .where(eq(bookingRequests.artistId, artistProfile.id))
      .orderBy(desc(bookingRequests.createdAt));

    return bookingData.map(data => ({
      ...data.booking_requests,
      venue: {
        ...data.venues,
        user: data.users
      }
    }));
  } else {
    const venueProfile = await getVenueProfile(targetUserId);
    if (!venueProfile) return [];

    const bookingData = await db
      .select()
      .from(bookingRequests)
      .innerJoin(artists, eq(bookingRequests.artistId, artists.id))
      .innerJoin(users, eq(artists.userId, users.id))
      .where(eq(bookingRequests.venueId, venueProfile.id))
      .orderBy(desc(bookingRequests.createdAt));

    return bookingData.map(data => ({
      ...data.booking_requests,
      artist: {
        ...data.artists,
        user: data.users
      }
    }));
  }
}

export async function searchArtists(query: string, limit = 10): Promise<ArtistWithUser[]> {
  const searchResults = await db
    .select()
    .from(artists)
    .innerJoin(users, eq(artists.userId, users.id))
    .where(
      or(
        sql`${artists.stageName} ILIKE ${`%${query}%`}`,
        sql`${artists.bio} ILIKE ${`%${query}%`}`
      )
    )
    .limit(limit);

  return searchResults.map(result => ({
    ...result.artists,
    user: result.users
  }));
}

export async function searchVenues(query: string, city?: string, limit = 10): Promise<VenueWithUser[]> {
  let whereCondition = or(
    sql`${venues.name} ILIKE ${`%${query}%`}`,
    sql`${venues.description} ILIKE ${`%${query}%`}`
  );

  if (city) {
    whereCondition = and(
      whereCondition,
      sql`${venues.city} ILIKE ${`%${city}%`}`
    );
  }

  const searchResults = await db
    .select()
    .from(venues)
    .innerJoin(users, eq(venues.userId, users.id))
    .where(whereCondition)
    .limit(limit);

  return searchResults.map(result => ({
    ...result.venues,
    user: result.users
  }));
}

export async function searchEvents(query: string, genres?: string[], limit = 20): Promise<EventWithDetails[]> {
  let whereCondition = and(
    eq(events.status, 'published'),
    or(
      sql`${events.title} ILIKE ${`%${query}%`}`,
      sql`${events.description} ILIKE ${`%${query}%`}`
    )
  );

  const searchResults = await db
    .select()
    .from(events)
    .innerJoin(artists, eq(events.artistId, artists.id))
    .innerJoin(users, eq(artists.userId, users.id))
    .leftJoin(venues, eq(events.venueId, venues.id))
    .where(whereCondition)
    .orderBy(desc(events.eventDate))
    .limit(limit);

  return searchResults.map(data => ({
    ...data.events,
    artist: {
      ...data.artists,
      user: data.users
    },
    venue: data.venues || undefined,
    tickets: [],
    reviews: []
  }));
}

export async function getActivityLogs(userId?: number, limit = 50) {
  const targetUserId = userId || (await getSession())?.user?.id;
  if (!targetUserId) return [];

  return await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.userId, targetUserId))
    .orderBy(desc(activityLogs.timestamp))
    .limit(limit);
}

export async function createActivityLog(
  userId: number,
  entityType: string,
  entityId: number,
  action: string,
  metadata?: any,
  ipAddress?: string
) {
  await db.insert(activityLogs).values({
    userId,
    entityType,
    entityId,
    action,
    metadata,
    ipAddress: ipAddress || ''
  });
}

// Helper function to check if user has artist profile
export async function userHasArtistProfile(userId?: number): Promise<boolean> {
  const targetUserId = userId || (await getSession())?.user?.id;
  if (!targetUserId) return false;

  const [artist] = await db
    .select()
    .from(artists)
    .where(eq(artists.userId, targetUserId))
    .limit(1);

  return !!artist;
}

// Helper function to check if user has venue profile
export async function userHasVenueProfile(userId?: number): Promise<boolean> {
  const targetUserId = userId || (await getSession())?.user?.id;
  if (!targetUserId) return false;

  const [venue] = await db
    .select()
    .from(venues)
    .where(eq(venues.userId, targetUserId))
    .limit(1);

  return !!venue;
}
