'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookingRequest } from '@/lib/db/schema';
import useSWR from 'swr';
import { useState } from 'react';
import { 
  ArrowLeft,
  Calendar, 
  DollarSign, 
  Clock,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  MapPin,
  Users,
  Mail,
  Phone
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ExtendedBookingRequest = BookingRequest & {
  venue: {
    id: number;
    name: string;
    description: string | null;
    address: string;
    city: string;
    state: string | null;
    capacity: number;
    amenities: any;
    contactEmail: string | null;
    contactPhone: string | null;
    verified: boolean;
    user: {
      name: string | null;
    };
  };
  artist: {
    id: number;
    stageName: string;
    user: {
      name: string | null;
    };
  };
};

export default function ArtistBookingDetail({ params }: { params: { id: string } }) {
  const bookingId = parseInt(params.id);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { data: booking, error, mutate } = useSWR<ExtendedBookingRequest>(
    `/api/booking-requests/${bookingId}`,
    fetcher
  );

  const handleBookingAction = async (action: 'accept' | 'reject') => {
    setActionLoading(true);

    try {
      const response = await fetch(`/api/booking-requests/${bookingId}/action`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking');
      }

      // Refresh the booking data
      mutate();
    } catch (error) {
      console.error('Error updating booking:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="size-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="size-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="size-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="size-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="size-5 text-gray-500" />;
      default:
        return <MessageCircle className="size-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'accepted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-muted-foreground bg-muted border-muted';
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-500">Failed to load booking request. Please try again.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/dashboard/artist/bookings">
              <ArrowLeft className="size-4 mr-2" />
              Back to Bookings
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p>Loading booking request...</p>
        </div>
      </div>
    );
  }

  const amenities = Array.isArray(booking.venue.amenities) ? booking.venue.amenities : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link href="/dashboard/artist/bookings">
            <ArrowLeft className="size-4 mr-2" />
            Back to Bookings
          </Link>
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Performance Opportunity</h1>
            <p className="text-muted-foreground mt-2">
              At {booking.venue.name}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
            <div className="flex items-center gap-2">
              {getStatusIcon(booking.status)}
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Performance Date</p>
                    <p className="text-muted-foreground">
                      {new Date(booking.proposedDate).toLocaleString()}
                    </p>
                  </div>
                </div>

                {booking.proposedEndDate && (
                  <div className="flex items-center gap-3">
                    <Clock className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">End Time</p>
                      <p className="text-muted-foreground">
                        {new Date(booking.proposedEndDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {booking.proposedFee && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Offered Fee</p>
                      <p className="text-muted-foreground">
                        ${booking.proposedFee}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <MessageCircle className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Requested</p>
                    <p className="text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          {booking.message && (
            <Card>
              <CardHeader>
                <CardTitle>Message from Venue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{booking.message}</p>
              </CardContent>
            </Card>
          )}

          {/* Counter Offer */}
          {(booking.counterOfferFee || booking.counterOfferMessage) && (
            <Card>
              <CardHeader>
                <CardTitle>Counter Offer from Venue</CardTitle>
              </CardHeader>
              <CardContent>
                {booking.counterOfferFee && (
                  <div className="mb-3">
                    <p className="font-medium">Revised Fee: ${booking.counterOfferFee}</p>
                  </div>
                )}
                {booking.counterOfferMessage && (
                  <p className="text-muted-foreground">{booking.counterOfferMessage}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {booking.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleBookingAction('reject')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Decline Offer'}
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleBookingAction('accept')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Accept Performance'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Venue Info Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                Venue Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{booking.venue.name}</h3>
                  {booking.venue.verified && (
                    <p className="text-sm text-blue-600">✓ Verified Venue</p>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="size-4 mr-1" />
                    {booking.venue.city}, {booking.venue.state}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Users className="size-4 mr-1" />
                    {booking.venue.capacity} capacity
                  </div>
                  {booking.venue.user.name && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Contact: {booking.venue.user.name}
                    </p>
                  )}
                </div>

                {booking.venue.description && (
                  <div>
                    <p className="text-sm font-medium mb-1">About the Venue</p>
                    <p className="text-sm text-muted-foreground">{booking.venue.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-1">Address</p>
                  <p className="text-sm text-muted-foreground">{booking.venue.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.venue.city}, {booking.venue.state}
                  </p>
                </div>

                {(booking.venue.contactEmail || booking.venue.contactPhone) && (
                  <div>
                    <p className="text-sm font-medium mb-2">Contact Information</p>
                    <div className="space-y-2">
                      {booking.venue.contactEmail && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="size-4 mr-2" />
                          {booking.venue.contactEmail}
                        </div>
                      )}
                      {booking.venue.contactPhone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="size-4 mr-2" />
                          {booking.venue.contactPhone}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {amenities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity: string) => (
                        <span
                          key={amenity}
                          className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                        >
                          {amenity.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/artist/venues/${booking.venue.id}`}>
                      View Full Venue Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 