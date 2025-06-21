import { getArtistProfile, getUser } from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { artists } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

    return Response.json(artistProfile);
  } catch (error) {
    console.error('Error fetching artist profile:', error);
    return Response.json({ error: 'Failed to fetch artist profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'artist') {
      return Response.json({ error: 'Only artists can access this endpoint' }, { status: 403 });
    }

    const body = await request.json();
    const { stageName, bio, genres, socialLinks, basePrice, availability } = body;

    // Update the artist profile
    const [updatedArtist] = await db
      .update(artists)
      .set({
        stageName,
        bio,
        genres: JSON.stringify(genres),
        socialLinks: JSON.stringify(socialLinks),
        updatedAt: new Date()
      })
      .where(eq(artists.userId, user.id))
      .returning();

    if (!updatedArtist) {
      return Response.json({ error: 'Failed to update profile' }, { status: 404 });
    }

    return Response.json({
      success: true,
      artist: updatedArtist
    });

  } catch (error) {
    console.error('Error updating artist profile:', error);
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
} 