import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

const PRESET_DISTANCES = [5, 10, 15, 20, 25, 30];

const POPULAR_AREAS = [
  'Negombo Fish Harbor',
  'Weligama Landing Site',
  'Chilaw Harbor Pier',
  'Kalpitiya Lagoon Pier',
  'Beruwala Fisheries Harbor',
  'Galle Harbor Pier',
];

export default function S04DeliverySettingsScreen() {
  const { profile, updateProfile } = useFisherman();

  // 01. PREFILLED VALUES FROM EXISTING STATE
  const [deliveryAvailable, setDeliveryAvailable] = useState(
    profile.deliveryAvailable !== false,
  );
  const [maxDistanceKm, setMaxDistanceKm] = useState(profile.maxDistanceKm ?? 15);
  const [customDistanceInput, setCustomDistanceInput] = useState(
    (profile.maxDistanceKm ?? 15).toString(),
  );
  const [stallAddress, setStallAddress] = useState(
    profile.stallAddress ?? 'Stall #14, Pier Gate 02, Negombo Fish Harbor, Marine Drive',
  );
  const [village, setVillage] = useState(profile.village ?? 'Negombo Fish Harbor');
  const [contactNumber, setContactNumber] = useState(profile.contactNumber ?? '071 234 5678');

  // Phone error state
  const [phoneError, setPhoneError] = useState('');

  // 03. BEHAVIOR & VALIDATION: Stepper and Distance controls
  const handleDistancePreset = (km: number) => {
    if (!deliveryAvailable) return;
    setMaxDistanceKm(km);
    setCustomDistanceInput(km.toString());
  };

  const handleCustomDistanceChange = (val: string) => {
    setCustomDistanceInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
      setMaxDistanceKm(parsed);
    }
  };

  const handleAdjustDistance = (delta: number) => {
    if (!deliveryAvailable) return;
    const next = Math.max(1, Math.min(60, maxDistanceKm + delta));
    setMaxDistanceKm(next);
    setCustomDistanceInput(next.toString());
  };

  const validatePhone = (val: string): boolean => {
    const cleaned = val.replace(/[\s-]/g, '');
    if (!cleaned) {
      setPhoneError('Contact number is required.');
      return false;
    }
    const phoneRegex = /^(?:0|\+?94)?[1-9][0-9]{7,9}$/;
    if (!phoneRegex.test(cleaned)) {
      setPhoneError('Enter a valid phone number (e.g. 071 234 5678).');
      return false;
    }
    setPhoneError('');
    return true;
  };

  // 02. SAVE SETTINGS -> S02
  const handleSave = () => {
    const isPhoneValid = validatePhone(contactNumber);
    if (!isPhoneValid) {
      Alert.alert('Invalid Contact', 'Please provide a valid contact number for delivery coordination.');
      return;
    }

    if (!stallAddress.trim()) {
      Alert.alert('Required Field', 'Please provide your Shop / Selling Location address.');
      return;
    }

    if (!village.trim()) {
      Alert.alert('Required Field', 'Please specify your Village / Area.');
      return;
    }

    // Save into FishermanContext
    updateProfile({
      deliveryAvailable,
      maxDistanceKm,
      stallAddress: stallAddress.trim(),
      village: village.trim(),
      contactNumber: contactNumber.trim(),
      deliveryRadius: deliveryAvailable
        ? `${maxDistanceKm} km radius (${village.trim().split(' ')[0]})`
        : 'Harbor Pickup Only',
    });

    Alert.alert(
      'Delivery Settings Saved! (S04)',
      deliveryAvailable
        ? `Doorstep delivery is ACTIVE up to ${maxDistanceKm} km from ${village}.\nContact: ${contactNumber}`
        : `Doorstep delivery is PAUSED. Customers will be instructed to do direct harbor pickup at: ${stallAddress}`,
      [
        {
          text: 'Return to Profile (S02)',
          onPress: () => router.replace('/fisherman/profile'),
        },
      ],
    );
  };

  const handleCancel = () => {
    router.replace('/fisherman/profile');
  };

  return (
    <FishermanShell
      title="S04 · Delivery Settings"
      subtitle="Location, delivery radius & contact"
      back
      onBack={handleCancel}
      rightIcon="check"
      rightLabel="Save"
      onRightPress={handleSave}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S04</Text>
        </View>
        <Text style={styles.helperText}>Configure your seafood delivery operations</Text>
      </View>

      {/* 01. DELIVERY AVAILABLE TOGGLE */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.toggleTitleRow}>
              <Text style={styles.cardTitle}>Delivery Available</Text>
              <View
                style={[
                  styles.statusBadge,
                  deliveryAvailable ? styles.statusBadgeActive : styles.statusBadgePaused,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    deliveryAvailable
                      ? styles.statusBadgeTextActive
                      : styles.statusBadgeTextPaused,
                  ]}
                >
                  {deliveryAvailable ? 'ACTIVE' : 'OFF'}
                </Text>
              </View>
            </View>
            <Text style={styles.cardSub}>
              Enable home deliveries to nearby buyers or restrict to harbor pickup only.
            </Text>
          </View>

          <Switch
            value={deliveryAvailable}
            onValueChange={setDeliveryAvailable}
            trackColor={{ false: '#D4E2E0', true: ui.teal }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Toggle delivery availability"
          />
        </View>

        {/* STATUS HELPER BANNER */}
        <View
          style={[
            styles.statusBanner,
            deliveryAvailable ? styles.statusActiveBanner : styles.statusPausedBanner,
          ]}
        >
          <FishermanIcon
            name={deliveryAvailable ? 'check' : 'alert'}
            size={15}
            color={deliveryAvailable ? ui.success : ui.warning}
          />
          <Text
            style={[
              styles.statusBannerText,
              deliveryAvailable ? styles.statusActiveText : styles.statusPausedText,
            ]}
          >
            {deliveryAvailable
              ? 'Accepting doorstep delivery orders within your maximum kilometer radius.'
              : 'Delivery is turned OFF. Distance field is disabled; buyers will only see harbor pickup.'}
          </Text>
        </View>
      </View>

      {/* 01 & 03. MAXIMUM DELIVERY DISTANCE (KM) - DISABLED WHEN DELIVERY IS OFF */}
      <View
        style={[
          styles.card,
          !deliveryAvailable && styles.cardDisabled,
        ]}
      >
        <View style={styles.distanceHeaderRow}>
          <Text
            style={[
              styles.cardTitle,
              !deliveryAvailable && styles.disabledText,
            ]}
          >
            Maximum Delivery Distance (km)
          </Text>
          {!deliveryAvailable && (
            <View style={styles.disabledTag}>
              <Text style={styles.disabledTagText}>DISABLED (DELIVERY OFF)</Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.cardSub,
            !deliveryAvailable && styles.disabledSubText,
          ]}
        >
          {deliveryAvailable
            ? 'Set the maximum road distance (in km) you or your delivery rider can travel:'
            : 'Turn Delivery Available ON above to configure your maximum delivery distance.'}
        </Text>

        {/* HERO DISTANCE DISPLAY & STEPPER */}
        <View
          style={[
            styles.distanceHeroBox,
            !deliveryAvailable && styles.distanceHeroBoxDisabled,
          ]}
        >
          {/* STEPPER DECREMENT */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decrease distance by 5 km"
            disabled={!deliveryAvailable}
            onPress={() => handleAdjustDistance(-5)}
            style={({ pressed }) => [
              styles.stepperBtn,
              !deliveryAvailable && styles.stepperBtnDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.stepperBtnText,
                !deliveryAvailable && styles.stepperBtnTextDisabled,
              ]}
            >
              − 5 km
            </Text>
          </Pressable>

          <View style={styles.heroCenterCol}>
            <Text
              style={[
                styles.distanceHeroNumber,
                !deliveryAvailable && styles.distanceHeroNumberDisabled,
              ]}
            >
              {deliveryAvailable ? `${maxDistanceKm} km` : '0 km'}
            </Text>
            <Text
              style={[
                styles.distanceHeroSub,
                !deliveryAvailable && styles.disabledSubText,
              ]}
            >
              {deliveryAvailable ? 'from your selling location' : 'Delivery paused'}
            </Text>
          </View>

          {/* STEPPER INCREMENT */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Increase distance by 5 km"
            disabled={!deliveryAvailable}
            onPress={() => handleAdjustDistance(5)}
            style={({ pressed }) => [
              styles.stepperBtn,
              !deliveryAvailable && styles.stepperBtnDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.stepperBtnText,
                !deliveryAvailable && styles.stepperBtnTextDisabled,
              ]}
            >
              + 5 km
            </Text>
          </Pressable>
        </View>

        {/* PRESET DISTANCE CHIPS */}
        <Text
          style={[
            styles.inputLabel,
            !deliveryAvailable && styles.disabledText,
          ]}
        >
          Quick Distance Presets:
        </Text>
        <View style={styles.presetChipsRow}>
          {PRESET_DISTANCES.map((km) => {
            const isSelected = deliveryAvailable && maxDistanceKm === km;
            return (
              <Pressable
                key={km}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                disabled={!deliveryAvailable}
                onPress={() => handleDistancePreset(km)}
                style={[
                  styles.presetChip,
                  isSelected && styles.presetChipSelected,
                  !deliveryAvailable && styles.presetChipDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    isSelected && styles.presetChipTextSelected,
                    !deliveryAvailable && styles.presetChipTextDisabled,
                  ]}
                >
                  {km} km
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* CUSTOM KM INPUT */}
        <View style={styles.customKmRow}>
          <Text
            style={[
              styles.customKmLabel,
              !deliveryAvailable && styles.disabledText,
            ]}
          >
            Custom Radius (km):
          </Text>
          <TextInput
            value={customDistanceInput}
            onChangeText={handleCustomDistanceChange}
            editable={deliveryAvailable}
            keyboardType="number-pad"
            maxLength={3}
            placeholder="15"
            placeholderTextColor={ui.mutedLight}
            style={[
              styles.customKmInput,
              !deliveryAvailable && styles.customKmInputDisabled,
            ]}
          />
        </View>

        {/* 03. GPS TRACKING NOTICE */}
        <View style={styles.gpsNoticeBox}>
          <FishermanIcon name="pin" size={13} color={ui.tealDark} />
          <Text style={styles.gpsNoticeText}>
            GPS radius tracking is not required. Road delivery distance is measured simply from your harbor stall location.
          </Text>
        </View>
      </View>

      {/* 01. SHOP / SELLING LOCATION & VILLAGE / AREA */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Selling Location & Area</Text>
        <Text style={styles.cardSub}>
          Physical pickup address where customers and delivery riders meet you:
        </Text>

        {/* SHOP / SELLING LOCATION */}
        <Text style={styles.inputLabel}>Shop / Selling Location *</Text>
        <TextInput
          value={stallAddress}
          onChangeText={setStallAddress}
          placeholder="e.g. Stall #14, Pier Gate 02, Negombo Fish Harbor"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />
        <Text style={styles.inputHelp}>
          Provide specific stall or harbor mooring details so buyers find you easily.
        </Text>

        {/* VILLAGE / AREA */}
        <Text style={[styles.inputLabel, { marginTop: 12 }]}>Village / Area *</Text>
        <TextInput
          value={village}
          onChangeText={setVillage}
          placeholder="e.g. Negombo Fish Harbor"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        {/* POPULAR AREA CHIPS */}
        <Text style={styles.inputHelp}>Select a standard harbor landing area:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.areaChipsScroll}
        >
          {POPULAR_AREAS.map((area) => {
            const isSelected = village === area;
            return (
              <Pressable
                key={area}
                accessibilityRole="button"
                onPress={() => setVillage(area)}
                style={[styles.areaChip, isSelected && styles.areaChipSelected]}
              >
                <Text
                  style={[
                    styles.areaChipText,
                    isSelected && styles.areaChipTextSelected,
                  ]}
                >
                  📍 {area}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 01. CONTACT NUMBER */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Coordination Contact</Text>
        <Text style={styles.cardSub}>
          Direct phone number displayed on customer order summaries for delivery updates:
        </Text>

        <Text style={styles.inputLabel}>Contact Number *</Text>
        <TextInput
          value={contactNumber}
          onChangeText={(val) => {
            setContactNumber(val);
            if (phoneError) validatePhone(val);
          }}
          onBlur={() => validatePhone(contactNumber)}
          keyboardType="phone-pad"
          placeholder="e.g. 071 234 5678"
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, phoneError ? styles.inputError : null]}
        />
        {phoneError ? <Text style={styles.errorText}>⚠ {phoneError}</Text> : null}

        <View style={styles.contactHelperBox}>
          <FishermanIcon name="phone" size={13} color={ui.tealDark} />
          <Text style={styles.contactHelperText}>
            Customers will receive order confirmation SMS with this contact number.
          </Text>
        </View>
      </View>

      {/* 02. BUTTONS & NAVIGATION: SAVE SETTINGS -> S02 */}
      <View style={styles.actionsBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save Settings and Return to Profile (S02)"
          onPress={handleSave}
          style={styles.saveBtn}
        >
          <FishermanIcon name="check" size={17} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Settings (S02)</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel and Return to Profile (S02)"
          onPress={handleCancel}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Cancel (S02)</Text>
        </Pressable>
      </View>
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
  card: {
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
  cardDisabled: {
    backgroundColor: '#F5F8F9',
    borderColor: '#DDE5E8',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  cardSub: {
    fontSize: 11,
    color: ui.muted,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeActive: {
    backgroundColor: ui.successSoft,
  },
  statusBadgePaused: {
    backgroundColor: ui.warningSoft,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  statusBadgeTextActive: {
    color: ui.success,
  },
  statusBadgeTextPaused: {
    color: ui.warning,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  statusActiveBanner: {
    backgroundColor: ui.successSoft,
  },
  statusPausedBanner: {
    backgroundColor: ui.warningSoft,
  },
  statusBannerText: {
    fontSize: 11,
    fontWeight: '800',
    flex: 1,
    lineHeight: 15,
  },
  statusActiveText: {
    color: ui.success,
  },
  statusPausedText: {
    color: ui.warning,
  },
  distanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledTag: {
    backgroundColor: '#EAEFF1',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  disabledTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.5,
  },
  disabledText: {
    color: ui.muted,
  },
  disabledSubText: {
    color: ui.mutedLight,
  },
  distanceHeroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5FAF9',
    borderRadius: 18,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#D4ECE7',
  },
  distanceHeroBoxDisabled: {
    backgroundColor: '#EAEFF1',
    borderColor: '#DCE4E7',
  },
  stepperBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BEE3DC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: ui.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  stepperBtnDisabled: {
    backgroundColor: '#E2E8EA',
    borderColor: '#D0D8DB',
    opacity: 0.5,
  },
  stepperBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.tealDark,
  },
  stepperBtnTextDisabled: {
    color: ui.muted,
  },
  heroCenterCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceHeroNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: -0.5,
  },
  distanceHeroNumberDisabled: {
    color: ui.muted,
  },
  distanceHeroSub: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
    marginTop: 2,
  },
  presetChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 14,
  },
  presetChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F7FAFB',
    borderWidth: 1,
    borderColor: ui.border,
  },
  presetChipSelected: {
    backgroundColor: ui.teal,
    borderColor: ui.tealDark,
  },
  presetChipDisabled: {
    backgroundColor: '#EAEFF1',
    borderColor: '#DCE4E7',
    opacity: 0.6,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  presetChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  presetChipTextDisabled: {
    color: ui.muted,
  },
  customKmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FBFB',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 12,
  },
  customKmLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  customKmInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '800',
    color: ui.navy,
    width: 70,
    textAlign: 'center',
  },
  customKmInputDisabled: {
    backgroundColor: '#EAEFF1',
    borderColor: '#DCE4E7',
    color: ui.muted,
  },
  gpsNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ui.tealLight,
    padding: 10,
    borderRadius: 12,
  },
  gpsNoticeText: {
    fontSize: 10,
    color: ui.tealDark,
    fontWeight: '700',
    flex: 1,
    lineHeight: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
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
  inputError: {
    borderColor: ui.danger,
    backgroundColor: '#FFF7F8',
  },
  errorText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.danger,
    marginTop: 4,
  },
  inputHelp: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 4,
    marginBottom: 6,
  },
  areaChipsScroll: {
    gap: 6,
    paddingBottom: 4,
    marginTop: 4,
  },
  areaChip: {
    backgroundColor: '#F5FAF9',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4ECE7',
  },
  areaChipSelected: {
    backgroundColor: ui.teal,
    borderColor: ui.tealDark,
  },
  areaChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  areaChipTextSelected: {
    color: '#FFFFFF',
  },
  contactHelperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ui.tealLight,
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  contactHelperText: {
    fontSize: 10,
    color: ui.tealDark,
    fontWeight: '700',
    flex: 1,
    lineHeight: 14,
  },
  actionsBar: {
    gap: 10,
    marginTop: 8,
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: ui.teal,
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: ui.surface,
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: ui.muted,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
