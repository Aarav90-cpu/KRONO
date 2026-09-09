/**
 * Authentication and Verification Helpers for KRONO Social
 * Handles age calculation (13+ compliance) and location presets.
 */

export const MIN_REQUIRED_AGE = 13;

export const POPULAR_LOCATIONS = [
  'San Francisco, USA',
  'New York, USA',
  'London, UK',
  'Berlin, Germany',
  'Toronto, Canada',
  'Singapore',
  'Mumbai, India',
  'Sydney, Australia',
  'Paris, France',
  'Seoul, South Korea',
  'Amsterdam, Netherlands',
];

/**
 * Calculates accurate age from a birth date string (YYYY-MM-DD)
 */
export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return Math.max(0, age);
}

/**
 * Returns true if the user is 13 years or older
 */
export function isAgeEligible(birthDateString: string): boolean {
  if (!birthDateString) return false;
  return calculateAge(birthDateString) >= MIN_REQUIRED_AGE;
}

/**
 * Formats a date string into readable text
 */
export function formatReadableDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
