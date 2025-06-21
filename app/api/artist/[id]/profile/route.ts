import { db } from '@/lib/db/drizzle';
import { artists, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const artistId = parseInt(params.id);
    
    if (isNaN(artistId)) {
      return Response.json({ error: 'Invalid artist ID' }, { status: 400 });
    }

    const [artistData] = await db
      .select()
      .from(artists)
      .innerJoin(users, eq(artists.userId, users.id))
      .where(eq(artists.id, artistId))
      .limit(1);

    if (!artistData) {
      return Response.json({ error: 'Artist not found' }, { status: 404 });
    }

    const artistWithUser = {
      ...artistData.artists,
      user: artistData.users
    };

    return Response.json(artistWithUser);
  } catch (error) {
    console.error('Error fetching artist profile:', error);
    return Response.json({ error: 'Failed to fetch artist profile' }, { status: 500 });
  }
} 