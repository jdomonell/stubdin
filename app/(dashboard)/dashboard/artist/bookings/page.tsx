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
  Calendar, 
  DollarSign, 
  Clock,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Filter,
  MapPin,
  Users
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ExtendedBookingRequest = BookingRequest & {
  venue?: {
    id: number;
    name: string;
    city: string;
    state: string | null;
    capacity: number;
    user: {
      name: string | null;
    };
  };
};

export default function ArtistBookings() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  
  const { data: bookings, error, mutate } = useSWR<ExtendedBookingRequest[]>(
    '/api/artist/bookings',
    fetcher
  );

  const handleBookingAction = async (bookingId: number, action: 'accept' | 'reject') => {
    setActionLoading(prev => ({ ...prev, [bookingId]: true }));

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

      // Refresh the bookings list
      mutate();
    } catch (error) {
      console.error('Error updating booking:', error);
      // You could add a toast notification here
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const filteredBookings = bookings?.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="size-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="size-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="size-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="size-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="size-4 text-gray-500" />;
      default:
        return <MessageCircle className="size-4 text-muted-foreground" />;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-500">Failed to load booking requests. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground mt-2">
          Manage booking requests from venues and track your upcoming performances.
        </p>
      </div>

      {/* Filter buttons */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            Filter Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status === 'all' ? 'All Bookings' : status}
                {bookings && (
                  <span className="ml-2 px-2 py-1 bg-background/50 rounded text-xs">
                    {status === 'all' 
                      ? bookings.length 
                      : bookings.filter(b => b.status === status).length
                    }
                  </span>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking requests list */}
      {!bookings ? (
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="size-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' 
                ? "Start browsing venues to send booking requests and build your performance schedule."
                : `You don't have any ${filter} bookings at the moment.`
              }
            </p>
            <div className="flex gap-3 justify-center">
              {filter !== 'all' && (
                <Button variant="outline" onClick={() => setFilter('all')}>
                  View All Bookings
                </Button>
              )}
              <Button asChild>
                <Link href="/dashboard/artist/venues">Browse Venues</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(booking.status)}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {booking.venue?.name || 'Unknown Venue'}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="size-4 mr-1" />
                        {booking.venue?.city}, {booking.venue?.state}
                        <Users className="size-4 ml-3 mr-1" />
                        {booking.venue?.capacity} capacity
                      </div>
                      {booking.venue?.user?.name && (
                        <p className="text-sm text-muted-foreground">
                          Contact: {booking.venue.user.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Performance Date</p>
                      <p className="text-muted-foreground">
                        {new Date(booking.proposedDate).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {booking.proposedEndDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="size-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">End Time</p>
                        <p className="text-muted-foreground">
                          {new Date(booking.proposedEndDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.proposedFee && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="size-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Proposed Fee</p>
                        <p className="text-muted-foreground">
                          ${booking.proposedFee}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {booking.message && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Message from Venue</p>
                    <p className="text-sm text-muted-foreground">{booking.message}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Requested {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleBookingAction(booking.id, 'reject')}
                          disabled={actionLoading[booking.id]}
                        >
                          {actionLoading[booking.id] ? 'Processing...' : 'Decline'}
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleBookingAction(booking.id, 'accept')}
                          disabled={actionLoading[booking.id]}
                        >
                          {actionLoading[booking.id] ? 'Processing...' : 'Accept'}
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/artist/bookings/${booking.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 