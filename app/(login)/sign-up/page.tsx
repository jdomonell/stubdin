'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signUp } from '@/app/(login)/actions';
import { useActionState } from 'react';
import Link from 'next/link';
import { Music, Building, Heart } from 'lucide-react';

type ActionState = {
  error?: string;
  success?: string;
  email?: string;
  password?: string;
  name?: string;
};

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    signUp,
    { email: '', password: '', name: '' }
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join Stub'din
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            The artist-first ticketing and booking platform
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Choose your role and get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={state.name}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue={state.email}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Create a strong password"
                />
              </div>

              <div>
                <Label className="text-base font-medium">I am a...</Label>
                <RadioGroup name="role" defaultValue="fan" className="mt-3">
                  <div className="space-y-3">
                    <Label
                      htmlFor="fan"
                      className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                    >
                      <RadioGroupItem value="fan" id="fan" />
                      <Heart className="size-5 text-red-500" />
                      <div>
                        <div className="font-medium">Music Fan</div>
                        <div className="text-sm text-gray-500">
                          Discover and buy tickets to amazing live shows
                        </div>
                      </div>
                    </Label>

                    <Label
                      htmlFor="artist"
                      className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                    >
                      <RadioGroupItem value="artist" id="artist" />
                      <Music className="size-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Artist/Musician</div>
                        <div className="text-sm text-gray-500">
                          Create events, sell tickets, and connect with venues
                        </div>
                      </div>
                    </Label>

                    <Label
                      htmlFor="venue"
                      className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                    >
                      <RadioGroupItem value="venue" id="venue" />
                      <Building className="size-5 text-green-500" />
                      <div>
                        <div className="font-medium">Venue Owner</div>
                        <div className="text-sm text-gray-500">
                          List your venue and book amazing artists
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {state.error && (
                <div className="text-red-600 text-sm">{state.error}</div>
              )}

              {state.success && (
                <div className="text-green-600 text-sm">{state.success}</div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/sign-in"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
