import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import { AnimatedFishermanTabs } from '@/components/fisherman/AnimatedFishermanTabs';
import { FishermanProvider } from '@/components/fisherman/FishermanContext';

export default function FishermanLayout() {
  const pathname = usePathname();
  const segment = pathname.split('/').filter(Boolean)[1] ?? 'dashboard';
  const showTabs = [
    'dashboard',
    's01',
    'orders',
    'listings',
    'trips',
    'profile',
    's22',
    's23',
    's24',
    's25',
    's06',
    's12',
    's09',
    's21',
    's03',
    's04',
    'a07',
    's07',
    's08',
    's10',
    's13',
    's14',
    's15',
    's16',
    's17',
    's18',
    's19',
    's20',
  ].includes(segment);

  return (
    <FishermanProvider>
      <View style={{ flex: 1, backgroundColor: '#F4F8FA' }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F4F8FA' },
          }}
        >
          <Stack.Screen name="dashboard" options={{ animation: 'fade' }} />
          <Stack.Screen name="s01" options={{ animation: 'fade' }} />
          <Stack.Screen name="orders" options={{ animation: 'fade' }} />
          <Stack.Screen name="listings" options={{ animation: 'fade' }} />
          <Stack.Screen name="trips" options={{ animation: 'fade' }} />
          <Stack.Screen name="profile" options={{ animation: 'fade' }} />
          <Stack.Screen name="s06" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s07" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s08" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s12" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s13" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s14" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s15" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen
            name="s16"
            options={{
              animation: 'slide_from_bottom',
              presentation: 'transparentModal',
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
          <Stack.Screen name="s17" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen
            name="s18"
            options={{
              animation: 'slide_from_bottom',
              presentation: 'transparentModal',
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
          <Stack.Screen name="s19" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen
            name="s20"
            options={{
              animation: 'slide_from_bottom',
              presentation: 'transparentModal',
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
          <Stack.Screen name="s22" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s23" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s24" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s25" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s09" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s10" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s21" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s03" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s04" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="a07" options={{ animation: 'slide_from_right' }} />
        </Stack>
        {showTabs ? <AnimatedFishermanTabs current={segment} /> : null}
      </View>
    </FishermanProvider>
  );
}
