import { Redirect } from 'expo-router';

/**
 * Screen S01: Fisherman Dashboard (Home Screen Alias)
 * Redirects to the primary fisherman dashboard route `/fisherman/dashboard`.
 */
export default function S01Screen() {
  return <Redirect href="/fisherman/dashboard" />;
}
