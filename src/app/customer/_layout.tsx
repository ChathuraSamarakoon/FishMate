import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import { AnimatedCustomerTabs } from '@/components/customer/AnimatedCustomerTabs';
import { MarketplaceProvider } from '@/components/customer/MarketplaceContext';
import { CustomerProfileProvider } from '@/components/customer/CustomerProfileContext';

export default function CustomerLayout() {
  const pathname = usePathname();
  const segment = pathname.split('/').filter(Boolean)[1] ?? 'home';
  const showTabs = ['home', 'search', 'inquiries', 'account'].includes(segment);

  return (
    <MarketplaceProvider>
      <CustomerProfileProvider>
      <View style={{ flex: 1, backgroundColor: '#F5FAFA' }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F5FAFA' } }}>
          <Stack.Screen name="home" options={{ animation: 'fade' }} />
          <Stack.Screen name="search" options={{ animation: 'fade' }} />
          <Stack.Screen name="inquiries" options={{ animation: 'fade' }} />
          <Stack.Screen name="account" options={{ animation: 'fade' }} />
          <Stack.Screen name="edit-profile" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="listing/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="fisherman/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="connect" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="inquiry/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="cart" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="checkout" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="payment-method" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="payment-gateway" options={{ animation: 'fade' }} />
          <Stack.Screen name="payment-result" options={{ animation: 'fade' }} />
          <Stack.Screen name="orders" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="order/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="tracking/[id]" options={{ animation: 'slide_from_right' }} />
        </Stack>
        {showTabs ? <AnimatedCustomerTabs current={segment} /> : null}
      </View>
      </CustomerProfileProvider>
    </MarketplaceProvider>
  );
}
