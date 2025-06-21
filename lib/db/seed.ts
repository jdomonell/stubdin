import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { users, artists, venues } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const artistPlusProduct = await stripe.products.create({
    name: 'Artist Plus',
    description: 'Enhanced features for artists - advanced analytics, priority support',
  });

  await stripe.prices.create({
    product: artistPlusProduct.id,
    unit_amount: 1500, // $15 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 14,
    },
  });

  const venuePlusProduct = await stripe.products.create({
    name: 'Venue Plus',
    description: 'Enhanced features for venues - advanced booking tools, priority listings',
  });

  await stripe.prices.create({
    product: venuePlusProduct.id,
    unit_amount: 2500, // $25 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 14,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function seed() {
  // Create test fan user
  const fanPasswordHash = await hashPassword('fan123');
  const [fanUser] = await db
    .insert(users)
    .values([
      {
        name: 'Test Fan',
        email: 'fan@test.com',
        passwordHash: fanPasswordHash,
        role: "fan",
      },
    ])
    .returning();

  // Create test artist user
  const artistPasswordHash = await hashPassword('artist123');
  const [artistUser] = await db
    .insert(users)
    .values([
      {
        name: 'Test Artist',
        email: 'artist@test.com',
        passwordHash: artistPasswordHash,
        role: "artist",
      },
    ])
    .returning();

  // Create artist profile
  const [artistProfile] = await db
    .insert(artists)
    .values({
      userId: artistUser.id,
      stageName: 'The Test Band',
      bio: 'A test band for the platform demo',
      genres: ['rock', 'indie'],
      socialLinks: {
        website: 'https://thetestband.com',
        spotify: 'https://spotify.com/artist/testband',
        instagram: '@thetestband'
      },
      verified: true
    })
    .returning();

  // Create test venue user
  const venuePasswordHash = await hashPassword('venue123');
  const [venueUser] = await db
    .insert(users)
    .values([
      {
        name: 'Test Venue',
        email: 'venue@test.com',
        passwordHash: venuePasswordHash,
        role: "venue",
      },
    ])
    .returning();

  // Create venue profile
  const [venueProfile] = await db
    .insert(venues)
    .values({
      userId: venueUser.id,
      name: 'The Test Venue',
      description: 'A great venue for live music',
      address: '123 Music Street',
      city: 'Music City',
      state: 'CA',
      country: 'USA',
      postalCode: '90210',
      capacity: 300,
      amenities: ['sound_system', 'lighting', 'bar'],
      contactEmail: 'bookings@testvenue.com',
      contactPhone: '(555) 123-4567',
      verified: true
    })
    .returning();

  console.log('Initial users and profiles created.');
  console.log(`Fan user: fan@test.com / fan123`);
  console.log(`Artist user: artist@test.com / artist123`);
  console.log(`Venue user: venue@test.com / venue123`);

  await createStripeProducts();
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
