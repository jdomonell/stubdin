import { getUserTickets } from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tickets = await getUserTickets(session.user.id);
    return Response.json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    return Response.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
} 