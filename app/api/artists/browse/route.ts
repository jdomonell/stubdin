import { db } from '@/lib/db/drizzle';
import { artists, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only venues should be able to browse artists
    if (user.role !== 'venue') {
      return Response.json({ error: 'Only venues can browse artists' }, { status: 403 });
    }

    const artistsData = await db
      .select()
      .from(artists)
      .innerJoin(users, eq(artists.userId, users.id))
      .where(eq(users.role, 'artist'));

    const artistsWithUser = artistsData.map(data => ({
      ...data.artists,
      user: data.users
    }));

    return Response.json(artistsWithUser);
  } catch (error) {
    console.error('Error fetching artists for browse:', error);
    return Response.json({ error: 'Failed to fetch artists' }, { status: 500 });
  }
} 