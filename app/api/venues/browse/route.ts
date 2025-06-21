import { db } from '@/lib/db/drizzle';
import { venues, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only artists should be able to browse venues
    if (user.role !== 'artist') {
      return Response.json({ error: 'Only artists can browse venues' }, { status: 403 });
    }

    const venuesData = await db
      .select()
      .from(venues)
      .innerJoin(users, eq(venues.userId, users.id))
      .where(eq(users.role, 'venue'));

    const venuesWithUser = venuesData.map(data => ({
      ...data.venues,
      user: data.users
    }));

    return Response.json(venuesWithUser);
  } catch (error) {
    console.error('Error fetching venues for browse:', error);
    return Response.json({ error: 'Failed to fetch venues' }, { status: 500 });
  }
} 