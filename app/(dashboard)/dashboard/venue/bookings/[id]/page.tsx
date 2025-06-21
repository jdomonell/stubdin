'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BookingRequest } from '@/lib/db/schema';
import useSWR from 'swr';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Calendar, 
  DollarSign, 
  Clock,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Music,
  User,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ExtendedBookingRequest = BookingRequest & {
  artist: {
    id: number;
    stageName: string;
    bio: string | null;
    genres: any;
    socialLinks: any;
    verified: boolean;
    user: {
      name: string | null;
    };
  };
  venue: {
    id: number;
    name: string;
    user: {
      name: string | null;
    };
  };
};

export default function BookingDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const bookingId = parseInt(params.id);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [counterOfferFee, setCounterOfferFee] = useState('');
  const [counterOfferMessage, setCounterOfferMessage] = useState('');
  
  const { data: booking, error, mutate } = useSWR<ExtendedBookingRequest>(
    `/api/booking-requests/${bookingId}`,
    fetcher
  );

  const handleBookingAction = async (action: 'accept' | 'reject' | 'counter_offer') => {
    setActionLoading(true);

    try {
      const body: any = { action };
      if (action === 'counter_offer') {
        body.counterOfferFee = counterOfferFee || null;
        body.counterOfferMessage = counterOfferMessage || null;
      }

      const response = await fetch(`/api/booking-requests/${bookingId}/action`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking');
      }

      // Refresh the booking data
      mutate();
      
      if (action === 'counter_offer') {
        setShowCounterOffer(false);
        setCounterOfferFee('');
        setCounterOfferMessage('');
      }
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
            <Link href="/dashboard/venue/bookings">
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

  const genres = Array.isArray(booking.artist.genres) ? booking.artist.genres : [];
  const socialLinks = booking.artist.socialLinks as any || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link href="/dashboard/venue/bookings">
            <ArrowLeft className="size-4 mr-2" />
            Back to Bookings
          </Link>
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Booking Request</h1>
            <p className="text-muted-foreground mt-2">
              From {booking.artist.stageName}
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
              <CardTitle>Event Details</CardTitle>
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
                      <p className="font-medium">Proposed Fee</p>
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
                <CardTitle>Message from Artist</CardTitle>
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
                <CardTitle>Counter Offer</CardTitle>
              </CardHeader>
              <CardContent>
                {booking.counterOfferFee && (
                  <div className="mb-3">
                    <p className="font-medium">Counter Offer Fee: ${booking.counterOfferFee}</p>
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
                {!showCounterOffer ? (
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleBookingAction('reject')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Processing...' : 'Decline Request'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowCounterOffer(true)}
                    >
                      Make Counter Offer
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleBookingAction('accept')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Processing...' : 'Accept Request'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="counterFee">Counter Offer Fee (optional)</Label>
                      <Input
                        id="counterFee"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={counterOfferFee}
                        onChange={(e) => setCounterOfferFee(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="counterMessage">Message (optional)</Label>
                      <Textarea
                        id="counterMessage"
                        placeholder="Explain your counter offer..."
                        value={counterOfferMessage}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCounterOfferMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => setShowCounterOffer(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => handleBookingAction('counter_offer')}
                        disabled={actionLoading || (!counterOfferFee && !counterOfferMessage)}
                      >
                        {actionLoading ? 'Sending...' : 'Send Counter Offer'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Artist Info Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="size-5" />
                Artist Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{booking.artist.stageName}</h3>
                  {booking.artist.verified && (
                    <p className="text-sm text-blue-600">✓ Verified Artist</p>
                  )}
                  {booking.artist.user.name && (
                    <p className="text-sm text-muted-foreground">
                      <User className="size-4 inline mr-1" />
                      {booking.artist.user.name}
                    </p>
                  )}
                </div>

                {booking.artist.bio && (
                  <div>
                    <p className="text-sm font-medium mb-1">About</p>
                    <p className="text-sm text-muted-foreground">{booking.artist.bio}</p>
                  </div>
                )}

                {genres.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Genres</p>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre: string) => (
                        <span
                          key={genre}
                          className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(socialLinks.website || socialLinks.spotify || socialLinks.instagram) && (
                  <div>
                    <p className="text-sm font-medium mb-2">Links</p>
                    <div className="space-y-2">
                      {socialLinks.website && (
                        <a 
                          href={socialLinks.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:underline"
                        >
                          <ExternalLink className="size-4 mr-2" />
                          Website
                        </a>
                      )}
                      {socialLinks.spotify && (
                        <a 
                          href={socialLinks.spotify} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-green-600 hover:underline"
                        >
                          <ExternalLink className="size-4 mr-2" />
                          Spotify
                        </a>
                      )}
                      {socialLinks.instagram && (
                        <a 
                          href={socialLinks.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-pink-600 hover:underline"
                        >
                          <ExternalLink className="size-4 mr-2" />
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/venue/artists/${booking.artist.id}`}>
                      View Full Profile
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