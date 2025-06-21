import { db } from '@/lib/db/drizzle';
import { bookingRequests, venues, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'artist') {
      return Response.json({ error: 'Only artists can access this endpoint' }, { status: 403 });
    }

    // Get all booking requests for this artist with venue details
    const bookings = await db
      .select()
      .from(bookingRequests)
      .innerJoin(venues, eq(bookingRequests.venueId, venues.id))
      .leftJoin(users, eq(venues.userId, users.id))
      .where(eq(bookingRequests.artistId, user.id))
      .orderBy(bookingRequests.createdAt);

    // Format the response with both booking request and venue data
    const formattedBookings = bookings.map(booking => ({
      ...booking.booking_requests,
      venue: {
        ...booking.venues,
        user: booking.users
      }
    }));

    return Response.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching artist bookings:', error);
    return Response.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
} 