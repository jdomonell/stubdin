import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { 
  Search, 
  Music, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign,
  Filter,
  Users,
  Star,
  ExternalLink
} from 'lucide-react';
import { getPublicEvents, searchEvents } from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description: string | null;
    eventDate: Date;
    doorTime: Date | null;
    ticketPrice: string | null;
    ticketCapacity: number | null;
    ticketsSold: number;
    coverImage: string | null;
    genres: any;
    ageRestriction: string | null;
    artist: {
      id: number;
      stageName: string;
      genres: any;
      verified: boolean;
      user: {
        name: string | null;
      };
    };
    venue?: {
      id: number;
      name: string;
      city: string;
      state: string | null;
      address: string;
    } | null;
  };
  isLoggedIn: boolean;
}

function EventCard({ event, isLoggedIn }: EventCardProps) {
  const eventDate = new Date(event.eventDate);
  const doorTime = event.doorTime ? new Date(event.doorTime) : null;
  const availableTickets = event.ticketCapacity ? event.ticketCapacity - event.ticketsSold : null;
  
  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <div className="relative">
        {event.coverImage ? (
          <img 
            src={event.coverImage} 
            alt={event.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
            <Music className="size-16 text-white opacity-50" />
          </div>
        )}
        {event.artist.verified && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Star className="size-3 fill-current" />
            Verified
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors">
              {event.title}
            </CardTitle>
            <p className="text-sm text-gray-600 font-medium">
              by {event.artist.stageName}
            </p>
          </div>
          {event.ticketPrice && (
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                ${event.ticketPrice}
              </p>
              <p className="text-xs text-gray-500">per ticket</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {event.genres && Array.isArray(event.genres) && event.genres.slice(0, 2).map((genre: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {genre}
            </span>
          ))}
          {event.ageRestriction && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
              {event.ageRestriction}+
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            <span>{eventDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="size-4" />
            <span>
              {doorTime 
                ? `Doors ${doorTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                : `Event ${eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
              }
            </span>
          </div>
          
          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              <span className="truncate">
                {event.venue.name}, {event.venue.city}
                {event.venue.state && `, ${event.venue.state}`}
              </span>
            </div>
          )}
          
          {availableTickets !== null && (
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              <span>
                {availableTickets > 0 
                  ? `${availableTickets} tickets available`
                  : 'Sold out'
                }
              </span>
            </div>
          )}
        </div>
        
        {event.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {event.description}
          </p>
        )}
        
        <div className="flex gap-2">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          {isLoggedIn ? (
            <Link href={`/events/${event.id}/purchase`}>
              <Button className="px-6">
                Buy Tickets
              </Button>
            </Link>
          ) : (
            <Link href="/sign-up">
              <Button className="px-6">
                Sign Up to Buy
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EventGrid({ events, isLoggedIn }: { events: any[], isLoggedIn: boolean }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="size-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No events found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} isLoggedIn={isLoggedIn} />
      ))}
    </div>
  );
}

async function EventsContent({ searchQuery }: { searchQuery?: string }) {
  const session = await getSession();
  const isLoggedIn = !!session;
  
  let events;
  if (searchQuery && searchQuery.trim()) {
    events = await searchEvents(searchQuery.trim());
  } else {
    events = await getPublicEvents(50);
  }

  return <EventGrid events={events} isLoggedIn={isLoggedIn} />;
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: { q?: string; genre?: string; location?: string };
}) {
  const searchQuery = searchParams.q;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discover Events</h1>
              <p className="text-gray-600 mt-1">Find amazing live music events near you</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Music className="size-4" />
                Back to Stub'din
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form action="/discover" method="GET" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                  <Input
                    type="text"
                    name="q"
                    placeholder="Search events, artists, venues..."
                    defaultValue={searchQuery}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="sm:w-auto">
                Search
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="size-3" />
                Genre
              </Button>
              <Button type="button" variant="outline" size="sm" className="flex items-center gap-1">
                <MapPin className="size-3" />
                Location
              </Button>
              <Button type="button" variant="outline" size="sm" className="flex items-center gap-1">
                <Calendar className="size-3" />
                Date
              </Button>
              <Button type="button" variant="outline" size="sm" className="flex items-center gap-1">
                <DollarSign className="size-3" />
                Price
              </Button>
            </div>
          </form>
        </div>

        {/* Results */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }>
          <EventsContent searchQuery={searchQuery} />
        </Suspense>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Are you an artist or venue?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join Stub'din to sell tickets with fair pricing, connect with fans, 
            and grow your music career or venue business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-50">
                Join as Artist
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-50">
                Join as Venue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 