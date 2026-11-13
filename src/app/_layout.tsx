import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/** Screens own their safe areas; no global navbar/scrollview around the splash. */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#FBFCF8" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FBFCF8' },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="welcome" options={{ animation: 'none' }} />
        <Stack.Screen name="role-select" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}
