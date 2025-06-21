import { getPublicEvents } from '@/lib/db/queries';

export async function GET() {
  try {
    const events = await getPublicEvents(10);
    return Response.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return Response.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
} 