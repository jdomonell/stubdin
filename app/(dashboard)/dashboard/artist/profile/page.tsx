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
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { 
  User,
  Music,
  Globe,
  Instagram,
  Calendar,
  DollarSign,
  Save,
  Loader2
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ArtistProfile = {
  id: number;
  stageName: string;
  bio: string | null;
  genres: string[];
  socialLinks: {
    website?: string;
    instagram?: string;
    spotify?: string;
    youtube?: string;
  };
  verified: boolean;
  user: {
    name: string | null;
    email: string;
  };
};

const GENRE_OPTIONS = [
  'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Country', 'Jazz', 
  'Blues', 'Folk', 'Reggae', 'R&B', 'Soul', 'Funk', 
  'Punk', 'Metal', 'Alternative', 'Indie', 'Classical', 'World'
];

export default function ArtistProfile() {
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const { data: profile, error, mutate } = useSWR<ArtistProfile>(
    '/api/artist/profile',
    fetcher
  );

  // Form state
  const [formData, setFormData] = useState({
    stageName: '',
    bio: '',
    genres: [] as string[],
    socialLinks: {
      website: '',
      instagram: '',
      spotify: '',
      youtube: ''
    }
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        stageName: profile.stageName || '',
        bio: profile.bio || '',
        genres: Array.isArray(profile.genres) ? profile.genres : [],
        socialLinks: {
          website: profile.socialLinks?.website || '',
          instagram: profile.socialLinks?.instagram || '',
          spotify: profile.socialLinks?.spotify || '',
          youtube: profile.socialLinks?.youtube || ''
        }
      });
    }
  }, [profile]);

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch('/api/artist/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stageName: formData.stageName,
          bio: formData.bio || null,
          genres: formData.genres,
          socialLinks: formData.socialLinks
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setSaveMessage('Profile updated successfully!');
      mutate(); // Refresh the profile data
    } catch (error) {
      setSaveMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-500">Failed to load profile. Please try again.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Artist Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your artist information and booking preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stageName">Stage Name *</Label>
                <Input
                  id="stageName"
                  value={formData.stageName}
                  onChange={(e) => setFormData(prev => ({...prev, stageName: e.target.value}))}
                  placeholder="Your artist name"
                  required
                />
              </div>

            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                placeholder="Tell venues about your music and performance style..."
                rows={4}
              />
            </div>


          </CardContent>
        </Card>

        {/* Genres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="size-5" />
              Musical Genres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {GENRE_OPTIONS.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    formData.genres.includes(genre)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.socialLinks.website}
                  onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  type="url"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div>
                <Label htmlFor="spotify">Spotify</Label>
                <Input
                  id="spotify"
                  type="url"
                  value={formData.socialLinks.spotify}
                  onChange={(e) => handleSocialLinkChange('spotify', e.target.value)}
                  placeholder="https://open.spotify.com/artist/..."
                />
              </div>
              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  type="url"
                  value={formData.socialLinks.youtube}
                  onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/@username"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          {saveMessage && (
            <p className={`text-sm ${saveMessage.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {saveMessage}
            </p>
          )}
          <Button type="submit" disabled={saving} className="ml-auto">
            {saving ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 