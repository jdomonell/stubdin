import { getBookingRequests } from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await getBookingRequests('venue', session.user.id);
    return Response.json(bookings);
  } catch (error) {
    console.error('Error fetching venue bookings:', error);
    return Response.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
} 