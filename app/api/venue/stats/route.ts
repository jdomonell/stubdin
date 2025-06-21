import { getVenueProfile, getVenueEvents } from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { bookingRequests, events } from '@/lib/db/schema';
import { eq, count, and, gte, avg } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const venueProfile = await getVenueProfile(session.user.id);
    
    if (!venueProfile) {
      return Response.json({ error: 'Venue profile not found' }, { status: 404 });
    }

    // Get all events for this venue
    const venueEvents = await getVenueEvents(venueProfile.id);
    
    // Calculate statistics
    const totalEvents = venueEvents.length;
    const upcomingEvents = venueEvents.filter(
      event => new Date(event.eventDate) > new Date() && event.status === 'published'
    ).length;

    // Get pending booking requests
    const [pendingBookingsResult] = await db
      .select({ count: count() })
      .from(bookingRequests)
      .where(
        and(
          eq(bookingRequests.venueId, venueProfile.id),
          eq(bookingRequests.status, 'pending')
        )
      );

    const pendingBookings = pendingBookingsResult?.count || 0;

    // Calculate average capacity utilization (placeholder calculation)
    // In a real app, you'd calculate this based on actual ticket sales vs capacity
    const [capacityResult] = await db
      .select({ 
        avgSold: avg(events.ticketsSold),
        avgCapacity: avg(events.ticketCapacity)
      })
      .from(events)
      .where(
        and(
          eq(events.venueId, venueProfile.id),
          gte(events.eventDate, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) // Last 90 days
        )
      );

    const avgSold = Number(capacityResult?.avgSold || 0);
    const avgCapacity = Number(capacityResult?.avgCapacity || 100);
    const averageCapacity = avgCapacity > 0 ? Math.round((avgSold / avgCapacity) * 100) : 0;

    return Response.json({
      totalEvents,
      upcomingEvents,
      pendingBookings,
      averageCapacity
    });
  } catch (error) {
    console.error('Error fetching venue stats:', error);
    return Response.json({ error: 'Failed to fetch venue stats' }, { status: 500 });
  }
} 