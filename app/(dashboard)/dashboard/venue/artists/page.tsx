'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArtistWithUser } from '@/lib/db/schema';
import useSWR from 'swr';
import { useState } from 'react';
import { 
  Search, 
  Music, 
  MapPin, 
  Calendar, 
  Star,
  ExternalLink,
  MessageCircle,
  Users,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ArtistCardProps {
  artist: ArtistWithUser;
}

function ArtistCard({ artist }: ArtistCardProps) {
  const genres = Array.isArray(artist.genres) ? artist.genres : [];
  const socialLinks = artist.socialLinks as any || {};

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {artist.stageName}
              {artist.verified && (
                <CheckCircle className="size-4 text-blue-500" />
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {artist.user.name}
            </p>
          </div>
          <div className="flex gap-2">
            {socialLinks.spotify && (
              <Button variant="ghost" size="sm" asChild>
                <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
            {socialLinks.website && (
              <Button variant="ghost" size="sm" asChild>
                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {artist.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {artist.bio}
          </p>
        )}
        
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {genres.map((genre: string) => (
              <span
                key={genre}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" className="flex-1" asChild>
            <Link href={`/dashboard/venue/artists/${artist.id}/book`}>
              <MessageCircle className="size-4 mr-2" />
              Send Booking Request
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/venue/artists/${artist.id}`}>
              View Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ArtistFilters({ 
  searchQuery, 
  setSearchQuery, 
  selectedGenres, 
  setSelectedGenres 
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenres: string[];
  setSelectedGenres: (genres: string[]) => void;
}) {
  const commonGenres = [
    'rock', 'pop', 'indie', 'jazz', 'blues', 'folk', 
    'electronic', 'hip-hop', 'country', 'classical'
  ];

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Find Artists</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Search artists by name, style, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Genres</p>
            <div className="flex flex-wrap gap-2">
              {commonGenres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleGenre(genre)}
                  className="text-xs"
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BrowseArtists() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  
  const { data: artists, error, isLoading } = useSWR<ArtistWithUser[]>(
    '/api/artists/browse',
    fetcher
  );

  const filteredArtists = artists?.filter(artist => {
    const matchesSearch = !searchQuery || 
      artist.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.user.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const artistGenres = Array.isArray(artist.genres) ? artist.genres : [];
    const matchesGenres = selectedGenres.length === 0 || 
      selectedGenres.some(genre => 
        artistGenres.some((artistGenre: string) => 
          artistGenre.toLowerCase() === genre.toLowerCase()
        )
      );

    return matchesSearch && matchesGenres;
  }) || [];

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-500">Failed to load artists. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Artists</h1>
        <p className="text-muted-foreground mt-2">
          Discover talented artists and send booking requests for your venue.
        </p>
      </div>

      <ArtistFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
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
      ) : filteredArtists.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Music className="size-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No artists found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedGenres.length > 0
                ? "Try adjusting your search criteria"
                : "No artists are currently available on the platform"
              }
            </p>
            {(searchQuery || selectedGenres.length > 0) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenres([]);
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
} 