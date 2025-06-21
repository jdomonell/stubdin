import { db } from '@/lib/db/drizzle';
import { bookingRequests } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = parseInt(params.id);
    if (isNaN(bookingId)) {
      return Response.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const body = await request.json();
    const { action, counterOfferFee, counterOfferMessage } = body;

    // Validate action
    if (!['accept', 'reject', 'counter_offer'].includes(action)) {
      return Response.json({ 
        error: 'Invalid action. Must be accept, reject, or counter_offer' 
      }, { status: 400 });
    }

    // Get the existing booking request
    const [existingBooking] = await db
      .select()
      .from(bookingRequests)
      .where(eq(bookingRequests.id, bookingId))
      .limit(1);

    if (!existingBooking) {
      return Response.json({ error: 'Booking request not found' }, { status: 404 });
    }

    // Check if booking is already processed
    if (existingBooking.status !== 'pending') {
      return Response.json({ 
        error: 'Booking request has already been processed' 
      }, { status: 400 });
    }

    // Prepare update data based on action
    let updateData: any = {
      updatedAt: new Date()
    };

    switch (action) {
      case 'accept':
        updateData.status = 'accepted';
        break;
      case 'reject':
        updateData.status = 'rejected';
        break;
      case 'counter_offer':
        if (!counterOfferFee && !counterOfferMessage) {
          return Response.json({ 
            error: 'Counter offer must include fee or message' 
          }, { status: 400 });
        }
        updateData.status = 'pending'; // Keep as pending but with counter offer
        if (counterOfferFee) {
          updateData.counterOfferFee = counterOfferFee;
        }
        if (counterOfferMessage) {
          updateData.counterOfferMessage = counterOfferMessage;
        }
        break;
    }

    // Update the booking request
    const [updatedBooking] = await db
      .update(bookingRequests)
      .set(updateData)
      .where(eq(bookingRequests.id, bookingId))
      .returning();

    return Response.json({
      success: true,
      booking: updatedBooking,
      message: `Booking request ${action === 'counter_offer' ? 'counter offer sent' : action}ed successfully`
    });

  } catch (error) {
    console.error('Error updating booking request:', error);
    return Response.json({ 
      error: 'Failed to update booking request' 
    }, { status: 500 });
  }
} 