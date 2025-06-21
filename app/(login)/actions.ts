'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  artists,
  venues,
  activityLogs,
  type NewUser,
  type NewArtist,
  type NewVenue,
  type NewActivityLog,
  ActivityType
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';

async function logActivity(
  userId: number,
  entityType: string,
  entityId: number,
  type: ActivityType,
  ipAddress?: string,
  metadata?: any
) {
  const newActivity: NewActivityLog = {
    userId,
    entityType,
    entityId,
    action: type,
    ipAddress: ipAddress || '',
    metadata
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const [foundUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!foundUser) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundUser.id, 'user', foundUser.id, ActivityType.SIGN_IN)
  ]);

  // Redirect based on user role
  if (foundUser.role === 'artist') {
    redirect('/dashboard/artist');
  } else if (foundUser.role === 'venue') {
    redirect('/dashboard/venue');
  } else {
    redirect('/dashboard'); // fan dashboard
  }
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
  role: z.enum(['fan', 'artist', 'venue']).default('fan')
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, name, role } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'An account with this email already exists.',
      email,
      password,
      name
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    name,
    role
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create account. Please try again.',
      email,
      password,
      name
    };
  }

  await Promise.all([
    setSession(createdUser),
    logActivity(createdUser.id, 'user', createdUser.id, ActivityType.SIGN_UP)
  ]);

  // Redirect to profile setup based on role
  if (role === 'artist') {
    redirect('/dashboard/artist/setup');
  } else if (role === 'venue') {
    redirect('/dashboard/venue/setup');
  } else {
    redirect('/dashboard');
  }
});

export async function signOut() {
  const user = await getUser();
  if (user) {
    await logActivity(user.id, 'user', user.id, ActivityType.SIGN_OUT);
  }
  
  (await cookies()).delete('session');
  redirect('/');
}

// Artist profile setup
const artistSetupSchema = z.object({
  stageName: z.string().min(1).max(100),
  bio: z.string().optional(),
  genres: z.array(z.string()).optional(),
  website: z.string().url().optional(),
  spotify: z.string().url().optional(),
  instagram: z.string().optional()
});

export const setupArtistProfile = validatedActionWithUser(
  artistSetupSchema,
  async (data, formData, user) => {
    if (user.role !== 'artist') {
      return { error: 'You must be an artist to create an artist profile.' };
    }

    const { stageName, bio, genres, website, spotify, instagram } = data;

    // Check if artist profile already exists
    const [existingArtist] = await db
      .select()
      .from(artists)
      .where(eq(artists.userId, user.id))
      .limit(1);

    if (existingArtist) {
      return { error: 'Artist profile already exists.' };
    }

    const socialLinks = {
      ...(website && { website }),
      ...(spotify && { spotify }),
      ...(instagram && { instagram })
    };

    const newArtist: NewArtist = {
      userId: user.id,
      stageName,
      bio: bio || null,
      genres: genres || null,
      socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null
    };

    const [createdArtist] = await db.insert(artists).values(newArtist).returning();

    if (!createdArtist) {
      return { error: 'Failed to create artist profile. Please try again.' };
    }

    await logActivity(
      user.id,
      'artist',
      createdArtist.id,
      ActivityType.CREATE_ARTIST_PROFILE
    );

    redirect('/dashboard/artist');
  }
);

// Venue profile setup
const venueSetupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1).max(100),
  state: z.string().max(50).optional(),
  country: z.string().min(1).max(50),
  postalCode: z.string().max(20).optional(),
  capacity: z.number().min(1),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  amenities: z.array(z.string()).optional()
});

export const setupVenueProfile = validatedActionWithUser(
  venueSetupSchema,
  async (data, formData, user) => {
    if (user.role !== 'venue') {
      return { error: 'You must be a venue to create a venue profile.' };
    }

    // Check if venue profile already exists
    const [existingVenue] = await db
      .select()
      .from(venues)
      .where(eq(venues.userId, user.id))
      .limit(1);

    if (existingVenue) {
      return { error: 'Venue profile already exists.' };
    }

    const {
      name,
      description,
      address,
      city,
      state,
      country,
      postalCode,
      capacity,
      contactEmail,
      contactPhone,
      amenities
    } = data;

    const newVenue: NewVenue = {
      userId: user.id,
      name,
      description: description || null,
      address,
      city,
      state: state || null,
      country,
      postalCode: postalCode || null,
      capacity,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      amenities: amenities || null
    };

    const [createdVenue] = await db.insert(venues).values(newVenue).returning();

    if (!createdVenue) {
      return { error: 'Failed to create venue profile. Please try again.' };
    }

    await logActivity(
      user.id,
      'venue',
      createdVenue.id,
      ActivityType.CREATE_VENUE_PROFILE
    );

    redirect('/dashboard/venue');
  }
);

// Update user account
const updateAccountSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email()
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, formData, user) => {
    const { name, email } = data;

    // Check if email is already taken by another user
    if (email !== user.email) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        return { error: 'This email is already in use.' };
      }
    }

    await db
      .update(users)
      .set({
        name,
        email,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    await logActivity(
      user.id,
      'user',
      user.id,
      ActivityType.UPDATE_ACCOUNT
    );

    return { success: 'Account updated successfully.' };
  }
);

// Update password
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, formData, user) => {
    const { currentPassword, newPassword } = data;

    const isCurrentPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return { error: 'Current password is incorrect.' };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    await logActivity(
      user.id,
      'user',
      user.id,
      ActivityType.UPDATE_PASSWORD
    );

    return { success: 'Password updated successfully.' };
  }
);

// Delete account
export const deleteAccount = validatedActionWithUser(
  z.object({}),
  async (data, formData, user) => {
    await db
      .update(users)
      .set({
        deletedAt: new Date()
      })
      .where(eq(users.id, user.id));

    await logActivity(
      user.id,
      'user',
      user.id,
      ActivityType.DELETE_ACCOUNT
    );

    (await cookies()).delete('session');
    redirect('/');
  }
);
