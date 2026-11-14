import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import { AnimatedCustomerTabs } from '@/components/customer/AnimatedCustomerTabs';
import { MarketplaceProvider } from '@/components/customer/MarketplaceContext';

export default function CustomerLayout() {
  const pathname = usePathname();
  const segment = pathname.split('/').filter(Boolean)[1] ?? 'home';
  const showTabs = ['home', 'search', 'inquiries', 'account'].includes(segment);

  return (
    <MarketplaceProvider>
      <View style={{ flex: 1, backgroundColor: '#F5FAFA' }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F5FAFA' } }}>
          <Stack.Screen name="home" options={{ animation: 'fade' }} />
          <Stack.Screen name="search" options={{ animation: 'fade' }} />
          <Stack.Screen name="inquiries" options={{ animation: 'fade' }} />
          <Stack.Screen name="account" options={{ animation: 'fade' }} />
          <Stack.Screen name="listing/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="fisherman/[id]" options={{ animation: 'slide_from_right' }} />
        </Stack>
        {showTabs ? <AnimatedCustomerTabs current={segment} /> : null}
      </View>
    </MarketplaceProvider>
  );
}
