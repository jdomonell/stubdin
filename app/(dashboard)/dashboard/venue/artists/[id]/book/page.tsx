'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArtistWithUser } from '@/lib/db/schema';
import useSWR from 'swr';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Clock,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface BookingFormData {
  proposedDate: string;
  proposedEndDate: string;
  proposedFee: string;
  message: string;
}

export default function BookArtist({ params }: { params: { id: string } }) {
  const router = useRouter();
  const artistId = parseInt(params.id);
  
  const { data: artist, error } = useSWR<ArtistWithUser>(
    `/api/artist/${artistId}/profile`,
    fetcher
  );

  const [formData, setFormData] = useState<BookingFormData>({
    proposedDate: '',
    proposedEndDate: '',
    proposedFee: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Get venue profile to get venue ID
      const venueResponse = await fetch('/api/venue/profile');
      if (!venueResponse.ok) {
        throw new Error('Failed to get venue profile');
      }
      const venue = await venueResponse.json();

      const response = await fetch('/api/booking-requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId,
          venueId: venue.id,
          proposedDate: formData.proposedDate,
          proposedEndDate: formData.proposedEndDate || null,
          proposedFee: formData.proposedFee || null,
          message: formData.message || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send booking request');
      }

      // Redirect to bookings page with success message
      router.push('/dashboard/venue/bookings?success=booking-sent');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-500">Failed to load artist profile. Please try again.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/dashboard/venue/artists">
              <ArrowLeft className="size-4 mr-2" />
              Back to Artists
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p>Loading artist profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link href="/dashboard/venue/artists">
            <ArrowLeft className="size-4 mr-2" />
            Back to Artists
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold">Book {artist.stageName}</h1>
        <p className="text-muted-foreground mt-2">
          Send a booking request to {artist.stageName} for your venue.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Booking Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="proposedDate">Event Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                      <Input
                        id="proposedDate"
                        type="datetime-local"
                        value={formData.proposedDate}
                        onChange={(e) => handleInputChange('proposedDate', e.target.value)}
                        className="pl-10"
                        required
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="proposedEndDate">End Time (optional)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                      <Input
                        id="proposedEndDate"
                        type="datetime-local"
                        value={formData.proposedEndDate}
                        onChange={(e) => handleInputChange('proposedEndDate', e.target.value)}
                        className="pl-10"
                        min={formData.proposedDate}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="proposedFee">Proposed Fee (optional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      id="proposedFee"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.proposedFee}
                      onChange={(e) => handleInputChange('proposedFee', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Leave blank if you want to discuss compensation later
                  </p>
                </div>

                <div>
                  <Label htmlFor="message">Message to Artist</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell the artist about your event, venue, audience, or anything else that might be relevant..."
                    value={formData.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('message', e.target.value)}
                    rows={4}
                  />
                </div>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Sending...' : 'Send Booking Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Artist Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{artist.stageName}</h3>
                  <p className="text-sm text-muted-foreground">{artist.user.name}</p>
                </div>

                {artist.bio && (
                  <div>
                    <p className="text-sm font-medium mb-1">Bio</p>
                    <p className="text-sm text-muted-foreground">{artist.bio}</p>
                  </div>
                )}

                {Array.isArray(artist.genres) && artist.genres.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Genres</p>
                    <div className="flex flex-wrap gap-2">
                      {artist.genres.map((genre: string) => (
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 