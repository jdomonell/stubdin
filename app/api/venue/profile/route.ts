import { getVenueProfile } from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';

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

    return Response.json(venueProfile);
  } catch (error) {
    console.error('Error fetching venue profile:', error);
    return Response.json({ error: 'Failed to fetch venue profile' }, { status: 500 });
  }
} 