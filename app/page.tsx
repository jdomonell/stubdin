import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { 
  Music, 
  Building, 
  Heart, 
  DollarSign, 
  Shield, 
  Users,
  TrendingUp,
  Award,
  CheckCircle
} from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  // Check if user is logged in and redirect to dashboard
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Music className="size-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Stub'din</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/discover">
                <Button variant="ghost">Discover Events</Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Artist-First Ticketing<br />
              <span className="text-blue-600">& Booking Marketplace</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Fair, transparent ticketing and venue booking for artists, venues, and fans. 
              No hidden fees, no middlemen. Just honest connections in live music.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="text-lg px-8 py-3">
                  Join Stub'din Free
                </Button>
              </Link>
              <Link href="/discover">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Built for Everyone in Live Music
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="size-12 text-red-500 mx-auto mb-4" />
                <CardTitle>Music Fans</CardTitle>
                <CardDescription>
                  Discover amazing live shows with honest, transparent pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="size-4 text-green-500 mr-2" />
                    No hidden fees or surprise charges
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="size-4 text-green-500 mr-2" />
                    Fair ticket resale policies
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="size-4 text-green-500 mr-2" />
                    Support artists directly
                  </li>
                </ul>
                <Link href="/sign-up">
                  <Button variant="outline" className="w-full">
                    Join as Fan
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Music className="size-12 text-blue-500 mx-auto mb-4" />
                <CardTitle>Artists</CardTitle>
                <CardDescription>
                  Take control of your live events and maximize your revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="size-4 text-green-500 mr-2" />
                    Keep more of your ticket sales
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="size-4 text-green-500 mr-2" />
                    Own your fan data
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="size-4 text-green-500 mr-2" />
                    Connect with venues easily
                  </li>
                </ul>
                <Link href="/sign-up">
                  <Button className="w-full">
                    Join as Artist
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building className="size-12 text-green-500 mx-auto mb-4" />
                <CardTitle>Venues</CardTitle>
                <CardDescription>
                  Book amazing artists and streamline your operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="size-4 text-green-500 mr-2" />
                    Discover new talent
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="size-4 text-green-500 mr-2" />
                    Automated payouts
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="size-4 text-green-500 mr-2" />
                    Analytics and reporting
                  </li>
                </ul>
                <Link href="/sign-up">
                  <Button variant="outline" className="w-full">
                    Join as Venue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Stub'din?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <DollarSign className="size-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fair Pricing
              </h3>
              <p className="text-gray-600">
                ≤7% platform fee, no hidden charges. What you see is what you pay.
              </p>
            </div>

            <div className="text-center">
              <Shield className="size-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Anti-Bot Protection
              </h3>
              <p className="text-gray-600">
                Fair queuing and resale controls protect fans from scalping.
              </p>
            </div>

            <div className="text-center">
              <Users className="size-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Artist Control
              </h3>
              <p className="text-gray-600">
                Artists own their data, set resale rules, and control pricing.
              </p>
            </div>

            <div className="text-center">
              <TrendingUp className="size-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Growth Focused
              </h3>
              <p className="text-gray-600">
                Analytics and tools to help artists and venues grow their audience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Live Music?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of artists, venues, and fans who are building a fairer music industry.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-3">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Music className="size-6 text-blue-400 mr-2" />
              <span className="text-white font-semibold">Stub'din</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 Stub'din. Artist-first ticketing and booking.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 