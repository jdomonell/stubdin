'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { ArtistWithUser, Event, BookingRequest } from '@/lib/db/schema';
import useSWR from 'swr';
import { Suspense } from 'react';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  User,
  TrendingUp,
  Plus,
  MessageCircle,
  Music
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function ArtistStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ArtistStats() {
  const { data: stats } = useSWR('/api/artist/stats', fetcher);

  const statCards = [
    {
      title: 'Total Events',
      value: stats?.totalEvents || 0,
      icon: Calendar,
      color: 'text-blue-500'
    },
    {
      title: 'Tickets Sold',
      value: stats?.ticketsSold || 0,
      icon: Users,
      color: 'text-green-500'
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue || 0}`,
      icon: DollarSign,
      color: 'text-yellow-500'
    },
    {
      title: 'Upcoming Shows',
      value: stats?.upcomingEvents || 0,
      icon: TrendingUp,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`size-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ArtistDashboard() {
  const { data: artist } = useSWR<ArtistWithUser>('/api/artist/profile', fetcher);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {artist?.stageName || 'Artist'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your events, bookings, and connect with venues.
        </p>
      </div>

      <Suspense fallback={<ArtistStatsSkeleton />}>
        <ArtistStats />
      </Suspense>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>My Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Music className="size-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven't created any events yet. Start sharing your music with the world!
                </p>
                <Link href="/dashboard/artist/events/new">
                  <Button>Create Your First Event</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/artist/events/new">
                  <Button className="w-full justify-start">
                    <Plus className="size-4 mr-2" />
                    Create New Event
                  </Button>
                </Link>
                <Link href="/dashboard/artist/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Music className="size-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/dashboard/artist/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="size-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/dashboard/artist/bookings">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="size-4 mr-2" />
                    View All Bookings
                  </Button>
                </Link>
                <Link href="/dashboard/artist/venues">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="size-4 mr-2" />
                    Browse Venues
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
