'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { VenueWithUser, Event, BookingRequest } from '@/lib/db/schema';
import useSWR from 'swr';
import { Suspense } from 'react';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  TrendingUp,
  Plus,
  MessageCircle,
  Building2,
  Music,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function VenueStats() {
  const { data: stats, error } = useSWR('/api/venue/stats', fetcher);

  if (error) return <VenueStatsSkeleton />;
  if (!stats) return <VenueStatsSkeleton />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events Hosted</CardTitle>
          <Calendar className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
          <p className="text-xs text-muted-foreground">
            All time
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          <Clock className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
          <p className="text-xs text-muted-foreground">
            Next 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Booking Requests</CardTitle>
          <MessageCircle className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingBookings}</div>
          <p className="text-xs text-muted-foreground">
            Pending review
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Capacity</CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageCapacity}%</div>
          <p className="text-xs text-muted-foreground">
            Last 3 months
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function VenueStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="size-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecentBookingRequests() {
  const { data: bookings, error } = useSWR('/api/venue/bookings', fetcher);

  if (error) return <div>Failed to load booking requests</div>;
  if (!bookings) return <div>Loading...</div>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="size-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="size-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="size-4 text-red-500" />;
      default:
        return <MessageCircle className="size-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Booking Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="size-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No booking requests yet. Artists will find you through the marketplace!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(booking.status)}
                  <div>
                    <p className="font-medium">{booking.artist?.stageName || 'Unknown Artist'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.proposedDate).toLocaleDateString()}
                      {booking.proposedFee && ` • $${booking.proposedFee}`}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/venue/bookings/${booking.id}`}>
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
        {bookings.length > 5 && (
          <CardFooter className="pt-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/venue/bookings">View All Requests</Link>
            </Button>
          </CardFooter>
        )}
      </CardContent>
    </Card>
  );
}

export default function VenueDashboard() {
  const { data: venue } = useSWR<VenueWithUser>('/api/venue/profile', fetcher);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {venue?.name || 'Venue'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your bookings, connect with artists, and grow your venue.
        </p>
      </div>

      <Suspense fallback={<VenueStatsSkeleton />}>
        <VenueStats />
      </Suspense>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <RecentBookingRequests />
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/venue/artists">
                  <Button className="w-full justify-start">
                    <Music className="size-4 mr-2" />
                    Browse Artists
                  </Button>
                </Link>
                <Link href="/dashboard/venue/availability">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="size-4 mr-2" />
                    Manage Availability
                  </Button>
                </Link>
                <Link href="/dashboard/venue/bookings">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="size-4 mr-2" />
                    View All Bookings
                  </Button>
                </Link>
                <Link href="/dashboard/venue/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="size-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 