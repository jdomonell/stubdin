import { db } from '@/lib/db/drizzle';
import { bookingRequests, type NewBookingRequest } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { artistId, venueId, proposedDate, proposedEndDate, proposedFee, message } = body;

    // Validate required fields
    if (!artistId || !venueId || !proposedDate) {
      return Response.json({ 
        error: 'Missing required fields: artistId, venueId, proposedDate' 
      }, { status: 400 });
    }

    // Validate dates
    const requestDate = new Date(proposedDate);
    const now = new Date();
    if (requestDate <= now) {
      return Response.json({ 
        error: 'Proposed date must be in the future' 
      }, { status: 400 });
    }

    if (proposedEndDate) {
      const endDate = new Date(proposedEndDate);
      if (endDate <= requestDate) {
        return Response.json({ 
          error: 'End date must be after start date' 
        }, { status: 400 });
      }
    }

    // Create the booking request
    const newBookingRequest: NewBookingRequest = {
      artistId: parseInt(artistId),
      venueId: parseInt(venueId),
      proposedDate: requestDate,
      proposedEndDate: proposedEndDate ? new Date(proposedEndDate) : null,
      proposedFee: proposedFee ? proposedFee : null,
      message: message || null,
      status: 'pending'
    };

    const [createdBooking] = await db
      .insert(bookingRequests)
      .values(newBookingRequest)
      .returning();

    return Response.json({
      success: true,
      booking: createdBooking
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking request:', error);
    return Response.json({ 
      error: 'Failed to create booking request' 
    }, { status: 500 });
  }
} 