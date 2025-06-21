import { db } from '@/lib/db/drizzle';
import { bookingRequests, artists, venues, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = parseInt(params.id);
    if (isNaN(bookingId)) {
      return Response.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    // Get booking request with artist and venue details
    const [bookingData] = await db
      .select()
      .from(bookingRequests)
      .innerJoin(artists, eq(bookingRequests.artistId, artists.id))
      .innerJoin(venues, eq(bookingRequests.venueId, venues.id))
      .leftJoin(users, eq(artists.userId, users.id))
      .where(eq(bookingRequests.id, bookingId))
      .limit(1);

    if (!bookingData) {
      return Response.json({ error: 'Booking request not found' }, { status: 404 });
    }

    // Get venue user details separately
    const [venueUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, bookingData.venues.userId))
      .limit(1);

    const booking = {
      ...bookingData.booking_requests,
      artist: {
        ...bookingData.artists,
        user: bookingData.users
      },
      venue: {
        ...bookingData.venues,
        user: venueUser
      }
    };

    return Response.json(booking);
  } catch (error) {
    console.error('Error fetching booking request:', error);
    return Response.json({ error: 'Failed to fetch booking request' }, { status: 500 });
  }
} 