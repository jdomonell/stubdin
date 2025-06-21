import { getArtistProfile, getArtistEvents } from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { tickets, events } from '@/lib/db/schema';
import { eq, sum, count, and, gte } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const artistProfile = await getArtistProfile(session.user.id);
    
    if (!artistProfile) {
      return Response.json({ error: 'Artist profile not found' }, { status: 404 });
    }

    // Get all events for this artist
    const artistEvents = await getArtistEvents(artistProfile.id);
    
    // Calculate statistics
    const totalEvents = artistEvents.length;
    const upcomingEvents = artistEvents.filter(
      event => new Date(event.eventDate) > new Date() && event.status === 'published'
    ).length;

    // Get ticket sales and revenue data
    const ticketStats = await db
      .select({
        totalTickets: sum(tickets.purchasePrice),
        ticketCount: count(tickets.id)
      })
      .from(tickets)
      .innerJoin(events, eq(tickets.eventId, events.id))
      .where(eq(events.artistId, artistProfile.id));

    const totalRevenue = Number(ticketStats[0]?.totalTickets || 0);
    const ticketsSold = Number(ticketStats[0]?.ticketCount || 0);

    return Response.json({
      totalEvents,
      upcomingEvents,
      totalRevenue,
      ticketsSold
    });
  } catch (error) {
    console.error('Error fetching artist stats:', error);
    return Response.json({ error: 'Failed to fetch artist stats' }, { status: 500 });
  }
} 