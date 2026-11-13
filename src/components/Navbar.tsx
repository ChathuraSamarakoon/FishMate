import { Link, usePathname, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { theme } from '@/constants/theme';

const routes: { href: Href; label: string }[] = [
  { href: '/', label: 'Welcome' },
  { href: '/login', label: 'Login' },
  { href: '/register', label: 'Register' },
  { href: '/home', label: 'Home' },
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <View style={styles.nav}>
      {routes.map(({ href, label }) => (
        <Link
          key={label}
          href={href}
          accessibilityState={{ selected: pathname === href }}
          style={[styles.link, pathname === href && styles.active]}
        >
          {label}
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  link: {
    padding: theme.spacing.sm,
    paddingVertical: 14,
    color: theme.colors.primary,
    fontSize: 14,
    borderRadius: theme.radius.sm,
  },
  active: { backgroundColor: theme.colors.surface, fontWeight: '700' },
});
