import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const logo = require('../../assets/fishmate/fishmate-complete.png');

export default function RoleSelectScreen() {
  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Image source={logo} resizeMode="contain" style={styles.logo} />
        <Text style={styles.heading}>How will you use FishMate?</Text>
        <Text style={styles.description}>Choose your role to continue.</Text>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={() => router.push({ pathname: '/register', params: { role: 'customer' } })}
        >
          <Text style={styles.cardEmoji}>🛒</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardHeading}>I'm a Customer</Text>
            <Text style={styles.cardBody}>Explore fresh fish and connect with local fishermen.</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={() => router.push({ pathname: '/register', params: { role: 'fisherman' } })}
        >
          <Text style={styles.cardEmoji}>⚓</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardHeading}>I'm a Fisherman</Text>
            <Text style={styles.cardBody}>Show your catch and manage your fishing activity.</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={() => router.push('/login')} style={styles.signIn}>
          <Text style={styles.signInText}>Already have an account? <Text style={styles.signInAccent}>Log in</Text></Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FBFCF8' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 27, maxWidth: 500, width: '100%', alignSelf: 'center' },
  logo: { width: 164, height: 124, alignSelf: 'center', marginBottom: 36 },
  heading: { fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: -0.9, color: '#173E56' },
  description: { fontSize: 14, textAlign: 'center', color: '#748790', marginTop: 10, marginBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 19, paddingHorizontal: 17, borderColor: '#E2ECEB', borderWidth: 1, borderRadius: 21, backgroundColor: '#FFFFFF', marginBottom: 14 },
  pressed: { opacity: 0.74 },
  cardEmoji: { fontSize: 29, marginRight: 13 },
  cardText: { flex: 1 },
  cardHeading: { fontSize: 16, fontWeight: '700', color: '#173E56' },
  cardBody: { fontSize: 12, color: '#6B838A', lineHeight: 18, marginTop: 4 },
  chevron: { fontSize: 29, color: '#0CA9A2', marginLeft: 8 },
  signIn: { marginTop: 22, alignItems: 'center', padding: 12 },
  signInText: { color: '#526971', fontSize: 13 },
  signInAccent: { fontWeight: '700', color: '#009F9B' },
});
