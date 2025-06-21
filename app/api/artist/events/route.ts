import { getArtistProfile, getArtistEvents } from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';

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

    const events = await getArtistEvents(artistProfile.id);
    return Response.json(events);
  } catch (error) {
    console.error('Error fetching artist events:', error);
    return Response.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
} 