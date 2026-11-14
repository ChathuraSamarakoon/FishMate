import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

const POPULAR_SPECIALTIES = [
  'Yellowfin tuna',
  'Red snapper',
  'Sea prawns',
  'King mackerel',
  'Blue crab',
  'Cleaned fillets',
  'Sailfish steaks',
  'Jumbo cuttlefish',
  'Mud crab',
  'Same-day chilled',
];

export default function S03EditProfileScreen() {
  const { profile, updateProfile } = useFisherman();

  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [village, setVillage] = useState(profile.village);
  const [contactNumber, setContactNumber] = useState(profile.contactNumber);
  const [bio, setBio] = useState(profile.bio);
  const [boatName, setBoatName] = useState(profile.boatName ?? 'Sagara Rani II');
  const [registrationNumber, setRegistrationNumber] = useState(
    profile.registrationNumber ?? 'CFV-A-4198-NEG',
  );
  const [stallAddress, setStallAddress] = useState(
    profile.stallAddress ?? 'Stall #14, Pier Gate 02, Negombo Fish Harbor, Marine Drive',
  );
  const [harborMooring, setHarborMooring] = useState(
    profile.harborMooring ?? 'Berth A-07 (Opposite Ice Factory)',
  );
  const [operatingHours, setOperatingHours] = useState(
    profile.operatingHours ?? '05:00 AM – 02:00 PM (Daily)',
  );
  const [specialties, setSpecialties] = useState<string[]>(profile.specialties);

  const toggleSpecialty = (spec: string) => {
    setSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec],
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your seller name.');
      return;
    }
    if (!contactNumber.trim()) {
      Alert.alert('Required Field', 'Please enter a contact phone number.');
      return;
    }

    updateProfile({
      name: name.trim(),
      title: title.trim(),
      village: village.trim(),
      contactNumber: contactNumber.trim(),
      bio: bio.trim(),
      boatName: boatName.trim(),
      registrationNumber: registrationNumber.trim(),
      stallAddress: stallAddress.trim(),
      harborMooring: harborMooring.trim(),
      operatingHours: operatingHours.trim(),
      specialties,
    });

    Alert.alert(
      'Profile Updated! (S03)',
      'Your storefront details, vessel registration, and specialties have been successfully saved.',
      [
        {
          text: 'View Storefront',
          onPress: () => router.replace('/fisherman/profile'),
        },
      ],
    );
  };

  return (
    <FishermanShell
      title="S03 · Edit Profile"
      subtitle="Public storefront & vessel information"
      back
      rightIcon="check"
      rightLabel="Save"
      onRightPress={handleSave}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S03</Text>
        </View>
        <Text style={styles.helperText}>Seller profile & harbor credentials editor</Text>
      </View>

      {/* AVATAR BANNER */}
      <View style={styles.avatarCard}>
        <Image source={profile.avatar} style={styles.avatarImg} resizeMode="cover" />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={styles.avatarName}>{name || 'Seller Name'}</Text>
          <Text numberOfLines={1} style={styles.avatarSub}>{village || 'Harbor'}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => Alert.alert('Change Photo', 'Photo uploaded from harbor camera or gallery.')}
            style={styles.changePhotoBtn}
          >
            <FishermanIcon name="sparkles" size={13} color={ui.tealDark} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </Pressable>
        </View>
      </View>

      {/* BASIC DETAILS FORM */}
      <View style={styles.formSection}>
        <Text style={styles.sectionHeading}>Basic Information</Text>

        <Text style={styles.inputLabel}>Full Name / Business Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Sunil Perera"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Professional Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Master Fisherman & Harbor Supplier"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Harbor Village / Region *</Text>
        <TextInput
          value={village}
          onChangeText={setVillage}
          placeholder="e.g. Negombo Fish Harbor"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Primary Contact Phone Number *</Text>
        <TextInput
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
          placeholder="e.g. 071 234 5678"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Storefront Bio / Customer Greeting</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          placeholder="Describe your catch landing, freshness and boat sourcing..."
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, styles.textArea]}
        />
      </View>

      {/* VESSEL & HARBOR CREDENTIALS */}
      <View style={styles.formSection}>
        <Text style={styles.sectionHeading}>Vessel & Pier Location</Text>

        <Text style={styles.inputLabel}>Fishing Vessel (Boat Name)</Text>
        <TextInput
          value={boatName}
          onChangeText={setBoatName}
          placeholder="e.g. Sagara Rani II"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Harbor Registration Number</Text>
        <TextInput
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
          placeholder="e.g. CFV-A-4198-NEG"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Stall / Mooring Address</Text>
        <TextInput
          value={stallAddress}
          onChangeText={setStallAddress}
          placeholder="e.g. Stall #14, Pier Gate 02, Negombo Fish Harbor"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Berth Mooring Spot</Text>
        <TextInput
          value={harborMooring}
          onChangeText={setHarborMooring}
          placeholder="e.g. Berth A-07 (Opposite Ice Factory)"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Daily Operating Hours</Text>
        <TextInput
          value={operatingHours}
          onChangeText={setOperatingHours}
          placeholder="e.g. 05:00 AM – 02:00 PM (Daily)"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />
      </View>

      {/* SPECIALTIES SELECTOR */}
      <View style={styles.formSection}>
        <Text style={styles.sectionHeading}>Fish Types Sold & Specialties</Text>
        <Text style={styles.subHeadingText}>
          Select all fish and seafood types you regularly sell:
        </Text>

        <View style={styles.chipsWrap}>
          {POPULAR_SPECIALTIES.map((spec) => {
            const selected = specialties.includes(spec);
            return (
              <Pressable
                key={spec}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => toggleSpecialty(spec)}
                style={[styles.chip, selected && styles.chipActive]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                  {selected ? '✓ ' : '+ '}
                  {spec}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* SAVE BUTTON */}
      <Pressable
        accessibilityRole="button"
        onPress={handleSave}
        style={styles.saveBtn}
      >
        <FishermanIcon name="check" size={17} color="#FFFFFF" />
        <Text style={styles.saveBtnText}>Save Storefront Profile (S03)</Text>
      </Pressable>
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  screenTag: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  screenTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.8,
  },
  helperText: {
    fontSize: 11,
    color: ui.muted,
    flex: 1,
  },
  avatarCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: ui.tealLight,
  },
  avatarName: {
    fontSize: 17,
    fontWeight: '900',
    color: ui.navy,
  },
  avatarSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ui.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  changePhotoText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  formSection: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 6,
  },
  subHeadingText: {
    fontSize: 11,
    color: ui.muted,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F7FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    color: ui.navy,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 74,
    textAlignVertical: 'top',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F5FAF9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4ECE7',
  },
  chipActive: {
    backgroundColor: ui.teal,
    borderColor: ui.tealDark,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: ui.teal,
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 20,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
