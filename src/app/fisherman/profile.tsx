import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { SectionHeader } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { currentFishermanProfile } from '@/data/fishermanData';
import { getSession, logout } from '@/services/demoAuth';

export default function FishermanProfileScreen() {
  const session = getSession();
  const name =
    session && session.role === 'fisherman'
      ? session.fullName
      : currentFishermanProfile.name;
  const phone =
    session && session.role === 'fisherman'
      ? session.phone
      : currentFishermanProfile.contactNumber;

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out of your fisherman account?', [
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <FishermanShell
      title="Fisherman Profile"
      subtitle="Boat credentials & seller account"
      rightIcon="user"
    >
      <View style={styles.profileCard}>
        <Image
          source={currentFishermanProfile.avatar}
          style={styles.avatar}
          resizeMode="cover"
        />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.title}>{currentFishermanProfile.title}</Text>
        <View style={styles.villagePill}>
          <FishermanIcon name="pin" size={13} color={ui.tealDark} />
          <Text style={styles.villageText}>{currentFishermanProfile.village}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Mobile Phone</Text>
          <Text style={styles.detailValue}>{phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fishing Vessel</Text>
          <Text style={styles.detailValue}>{currentFishermanProfile.boatName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Harbor Registration</Text>
          <Text style={styles.detailValue}>{currentFishermanProfile.registrationNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Delivery Coverage</Text>
          <Text style={styles.detailValue}>{currentFishermanProfile.deliveryRadius}</Text>
        </View>
      </View>

      <SectionHeader title="Catch Specialties" subtitle="Featured products on your storefront" />

      <View style={styles.specialtiesWrap}>
        {currentFishermanProfile.specialties.map((spec, i) => (
          <View key={i} style={styles.specialtyChip}>
            <Text style={styles.specialtyText}>✦ {spec}</Text>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={handleLogout}
        style={styles.logoutBtn}
      >
        <Text style={styles.logoutBtnText}>Log Out of Fisherman Account</Text>
      </Pressable>
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: ui.surface,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: ui.border,
    alignItems: 'center',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: ui.tealLight,
  },
  name: {
    fontSize: 22,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 14,
  },
  title: {
    fontSize: 12,
    color: ui.muted,
    marginTop: 3,
  },
  villagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ui.tealLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
  },
  villageText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  divider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    width: '100%',
    marginVertical: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 12,
    gap: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: ui.muted,
    fontWeight: '600',
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
    flex: 1,
    textAlign: 'right',
    lineHeight: 18,
  },
  specialtiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    backgroundColor: ui.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ui.border,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  logoutBtn: {
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: '#F3B4BB',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    marginBottom: 10,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B84958',
  },
});
