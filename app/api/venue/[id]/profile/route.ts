import { db } from '@/lib/db/drizzle';
import { venues, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = parseInt(params.id);
    
    if (isNaN(venueId)) {
      return Response.json({ error: 'Invalid venue ID' }, { status: 400 });
    }

    const [venueData] = await db
      .select()
      .from(venues)
      .innerJoin(users, eq(venues.userId, users.id))
      .where(eq(venues.id, venueId))
      .limit(1);

    if (!venueData) {
      return Response.json({ error: 'Venue not found' }, { status: 404 });
    }

    const venueWithUser = {
      ...venueData.venues,
      user: venueData.users
    };

    return Response.json(venueWithUser);
  } catch (error) {
    console.error('Error fetching venue profile:', error);
    return Response.json({ error: 'Failed to fetch venue profile' }, { status: 500 });
  }
} 