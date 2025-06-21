'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { User, EventWithDetails, Ticket } from '@/lib/db/schema';
import useSWR from 'swr';
import { Suspense } from 'react';
import { Calendar, MapPin, Ticket as TicketIcon, Search, Heart } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UpcomingEventsSkeleton() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="size-16 rounded-lg bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingEvents() {
  const { data: events } = useSWR<EventWithDetails[]>('/api/events/upcoming', fetcher);

  if (!events || events.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No upcoming events found. Start exploring to discover new shows!
          </p>
          <div className="text-center">
            <Link href="/dashboard/discover">
              <Button>Discover Events</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.slice(0, 3).map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                {event.coverImage && (
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="size-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    by {event.artist.stageName}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="size-4 mr-1" />
                    {new Date(event.eventDate).toLocaleDateString()}
                    {event.venue && (
                      <>
                        <MapPin className="size-4 ml-3 mr-1" />
                        {event.venue.name}
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {event.ticketPrice && (
                    <p className="font-semibold">${event.ticketPrice}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {event.ticketCapacity && event.ticketsSold !== null
                      ? `${event.ticketCapacity - event.ticketsSold} left`
                      : 'Available'
                    }
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {events.length > 3 && (
          <CardFooter className="pt-4">
            <Link href="/dashboard/discover" className="w-full">
              <Button variant="outline" className="w-full">
                View All Events
              </Button>
            </Link>
          </CardFooter>
        )}
      </CardContent>
    </Card>
  );
}

function MyTicketsSkeleton() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>My Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="size-12 rounded bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MyTickets() {
  const { data: tickets } = useSWR<Ticket[]>('/api/tickets/mine', fetcher);

  if (!tickets || tickets.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            You don't have any tickets yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>My Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tickets.slice(0, 2).map((ticket) => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
              <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <TicketIcon className="size-12 text-blue-500" />
                <div className="flex-1">
                  <h3 className="font-semibold">#{ticket.ticketNumber}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${ticket.purchasePrice}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.status === 'sold' ? 'bg-green-100 text-green-800' :
                    ticket.status === 'used' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {tickets.length > 2 && (
          <CardFooter className="pt-4">
            <Link href="/dashboard/tickets" className="w-full">
              <Button variant="outline" className="w-full">
                View All Tickets
              </Button>
            </Link>
          </CardFooter>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/discover">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <Search className="size-6 mb-2" />
              <span>Discover Events</span>
            </Button>
          </Link>
          <Link href="/dashboard/favorites">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <Heart className="size-6 mb-2" />
              <span>My Favorites</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FanDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">
          Discover amazing live music experiences and manage your tickets.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Suspense fallback={<UpcomingEventsSkeleton />}>
            <UpcomingEvents />
          </Suspense>
          
          <Suspense fallback={<MyTicketsSkeleton />}>
            <MyTickets />
          </Suspense>
        </div>

        <div className="space-y-8">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
