'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { VenueWithUser } from '@/lib/db/schema';
import useSWR from 'swr';
import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Users, 
  Building2,  
  ExternalLink,
  MessageCircle,
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface VenueCardProps {
  venue: VenueWithUser;
}

function VenueCard({ venue }: VenueCardProps) {
  const amenities = Array.isArray(venue.amenities) ? venue.amenities : [];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {venue.name}
              {venue.verified && (
                <CheckCircle className="size-4 text-blue-500" />
              )}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="size-4 mr-1" />
              {venue.city}, {venue.state} {venue.country}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm">
              <Users className="size-4 mr-1" />
              {venue.capacity} capacity
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {venue.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {venue.description}
          </p>
        )}

        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Address</p>
          <p className="text-sm text-muted-foreground">{venue.address}</p>
        </div>
        
        {amenities.length > 0 && (
          <div className="mb-4">
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

        {(venue.contactEmail || venue.contactPhone) && (
          <div className="mb-4 space-y-1">
            {venue.contactEmail && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="size-4 mr-2" />
                {venue.contactEmail}
              </div>
            )}
            {venue.contactPhone && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="size-4 mr-2" />
                {venue.contactPhone}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" className="flex-1" asChild>
            <Link href={`/dashboard/artist/venues/${venue.id}/book`}>
              <MessageCircle className="size-4 mr-2" />
              Send Booking Request
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/artist/venues/${venue.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VenueFilters({ 
  searchQuery, 
  setSearchQuery,
  capacityRange,
  setCapacityRange,
  selectedAmenities,
  setSelectedAmenities
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  capacityRange: string;
  setCapacityRange: (range: string) => void;
  selectedAmenities: string[];
  setSelectedAmenities: (amenities: string[]) => void;
}) {
  const commonAmenities = [
    'sound_system', 'lighting', 'bar', 'parking', 'green_room', 
    'stage', 'security', 'air_conditioning', 'wifi'
  ];

  const capacityOptions = [
    { label: 'Any Size', value: '' },
    { label: 'Small (< 100)', value: '0-100' },
    { label: 'Medium (100-500)', value: '100-500' },
    { label: 'Large (500-1000)', value: '500-1000' },
    { label: 'Very Large (1000+)', value: '1000+' }
  ];

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Find Venues</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Search venues by name, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Capacity</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {capacityOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={capacityRange === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCapacityRange(option.value)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {commonAmenities.map((amenity) => (
                <Button
                  key={amenity}
                  variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAmenity(amenity)}
                  className="text-xs"
                >
                  {amenity.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BrowseVenues() {
  const [searchQuery, setSearchQuery] = useState('');
  const [capacityRange, setCapacityRange] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const { data: venues, error, isLoading } = useSWR<VenueWithUser[]>(
    '/api/venues/browse',
    fetcher
  );

  const filteredVenues = venues?.filter(venue => {
    const matchesSearch = !searchQuery || 
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCapacity = true;
    if (capacityRange) {
      const capacity = venue.capacity;
      switch (capacityRange) {
        case '0-100':
          matchesCapacity = capacity < 100;
          break;
        case '100-500':
          matchesCapacity = capacity >= 100 && capacity <= 500;
          break;
        case '500-1000':
          matchesCapacity = capacity >= 500 && capacity <= 1000;
          break;
        case '1000+':
          matchesCapacity = capacity > 1000;
          break;
      }
    }

    const venueAmenities = Array.isArray(venue.amenities) ? venue.amenities : [];
    const matchesAmenities = selectedAmenities.length === 0 || 
      selectedAmenities.every(amenity => venueAmenities.includes(amenity));

    return matchesSearch && matchesCapacity && matchesAmenities;
  }) || [];

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-500">Failed to load venues. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Venues</h1>
        <p className="text-muted-foreground mt-2">
          Discover venues and send booking requests to grow your audience.
        </p>
      </div>

      <VenueFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        capacityRange={capacityRange}
        setCapacityRange={setCapacityRange}
        selectedAmenities={selectedAmenities}
        setSelectedAmenities={setSelectedAmenities}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
                  <div className="flex gap-2">
                    <div className="h-8 flex-1 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredVenues.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="size-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No venues found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || capacityRange || selectedAmenities.length > 0
                ? "Try adjusting your search criteria"
                : "No venues are currently available on the platform"
              }
            </p>
            {(searchQuery || capacityRange || selectedAmenities.length > 0) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setCapacityRange('');
                  setSelectedAmenities([]);
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
} 