import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

const PRESET_DISTANCES = [5, 10, 15, 20, 25, 30];

const AVAILABLE_TOWNS = [
  'Negombo',
  'Kochchikade',
  'Ja-Ela',
  'Seeduwa',
  'Katunayake',
  'Pamunugama',
  'Wattala',
  'Marawila',
  'Waikkal',
  'Dankotuwa',
];

export default function S04DeliverySettingsScreen() {
  const { profile, updateProfile } = useFisherman();

  const [deliveryActive, setDeliveryActive] = useState(profile.deliveryAvailable !== false);
  const [maxDistanceKm, setMaxDistanceKm] = useState(profile.maxDistanceKm ?? 15);
  const [deliveryFee, setDeliveryFee] = useState((profile.deliveryFee ?? 250).toString());
  const [freeThreshold, setFreeThreshold] = useState(
    (profile.freeDeliveryThreshold ?? 5000).toString(),
  );
  const [selectedTowns, setSelectedTowns] = useState<string[]>(
    profile.deliveryTowns ?? ['Negombo', 'Kochchikade', 'Ja-Ela', 'Seeduwa', 'Katunayake'],
  );
  const [pickupNote, setPickupNote] = useState(
    'Direct pickup from harbor boat berth upon morning catch landing.',
  );

  const toggleTown = (town: string) => {
    setSelectedTowns((prev) =>
      prev.includes(town) ? prev.filter((t) => t !== town) : [...prev, town],
    );
  };

  const handleSave = () => {
    const feeNum = parseFloat(deliveryFee) || 0;
    const threshNum = parseFloat(freeThreshold) || 0;

    updateProfile({
      deliveryAvailable: deliveryActive,
      maxDistanceKm,
      deliveryFee: feeNum,
      freeDeliveryThreshold: threshNum,
      deliveryTowns: selectedTowns,
    });

    Alert.alert(
      'Delivery Settings Saved! (S04)',
      `Delivery radius set to ${maxDistanceKm} km with ${selectedTowns.length} covered towns. Standard fee: ${money(feeNum)}.`,
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
      title="S04 · Delivery Settings"
      subtitle="Coverage radius, delivery fees & towns"
      back
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

      {/* DELIVERY TOGGLE CARD */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.cardTitle}>Doorstep Seafood Delivery</Text>
            <Text style={styles.cardSub}>
              Enable home deliveries within your maximum harbor radius.
            </Text>
          </View>
          <Switch
            value={deliveryActive}
            onValueChange={setDeliveryActive}
            trackColor={{ false: '#D4E2E0', true: ui.teal }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View
          style={[
            styles.statusBanner,
            deliveryActive ? styles.statusActive : styles.statusPaused,
          ]}
        >
          <FishermanIcon
            name={deliveryActive ? 'check' : 'alert'}
            size={14}
            color={deliveryActive ? ui.success : ui.warning}
          />
          <Text
            style={[
              styles.statusText,
              deliveryActive ? styles.statusTextActive : styles.statusTextPaused,
            ]}
          >
            {deliveryActive
              ? 'Accepting both delivery orders and harbor pickups'
              : 'Delivery paused · Buyers can only do harbor pickup'}
          </Text>
        </View>
      </View>

      {/* MAXIMUM RADIUS SELECTOR */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Maximum Delivery Distance (Radius)</Text>
        <Text style={styles.cardSub}>
          Select the farthest distance from Negombo harbor you can deliver:
        </Text>

        <View style={styles.radiusHeroBox}>
          <Text style={styles.radiusHeroNum}>{maxDistanceKm} km</Text>
          <Text style={styles.radiusHeroSub}>from Negombo Harbor Pier</Text>
        </View>

        <View style={styles.presetChipsRow}>
          {PRESET_DISTANCES.map((dist) => {
            const active = maxDistanceKm === dist;
            return (
              <Pressable
                key={dist}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setMaxDistanceKm(dist)}
                style={[styles.presetChip, active && styles.presetChipActive]}
              >
                <Text style={[styles.presetText, active && styles.presetTextActive]}>
                  {dist} km
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* FEES & THRESHOLDS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Pricing & Incentives</Text>

        <Text style={styles.inputLabel}>Standard Delivery Fee (Rs.)</Text>
        <TextInput
          value={deliveryFee}
          onChangeText={setDeliveryFee}
          keyboardType="numeric"
          placeholder="250"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Free Delivery for Orders Over (Rs.)</Text>
        <TextInput
          value={freeThreshold}
          onChangeText={setFreeThreshold}
          keyboardType="numeric"
          placeholder="5000"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />
        <Text style={styles.inputHelp}>
          Encourages larger bulk seafood orders from nearby families & restaurants.
        </Text>
      </View>

      {/* COVERED TOWNS */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Covered Towns & Neighborhoods</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{selectedTowns.length} Selected</Text>
          </View>
        </View>
        <Text style={styles.cardSub}>
          Tap to include or exclude areas from your delivery route:
        </Text>

        <View style={styles.townsGrid}>
          {AVAILABLE_TOWNS.map((town) => {
            const selected = selectedTowns.includes(town);
            return (
              <Pressable
                key={town}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => toggleTown(town)}
                style={[styles.townItem, selected && styles.townItemActive]}
              >
                <Text style={[styles.townText, selected && styles.townTextActive]}>
                  {selected ? '✓ ' : '+ '}
                  {town}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* HARBOR PICKUP INSTRUCTIONS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Direct Harbor Pickup Notes</Text>
        <Text style={styles.cardSub}>
          Displayed to customers choosing self-pickup at the harbor pier:
        </Text>
        <TextInput
          value={pickupNote}
          onChangeText={setPickupNote}
          multiline
          numberOfLines={2}
          style={[styles.input, styles.textArea]}
        />
      </View>

      {/* SAVE BUTTON */}
      <Pressable
        accessibilityRole="button"
        onPress={handleSave}
        style={styles.saveBtn}
      >
        <FishermanIcon name="check" size={17} color="#FFFFFF" />
        <Text style={styles.saveBtnText}>Save Delivery Settings (S04)</Text>
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.tealDark,
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
    marginTop: 3,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  statusActive: {
    backgroundColor: ui.successSoft,
  },
  statusPaused: {
    backgroundColor: ui.warningSoft,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    flex: 1,
  },
  statusTextActive: {
    color: ui.success,
  },
  statusTextPaused: {
    color: ui.warning,
  },
  radiusHeroBox: {
    backgroundColor: '#F5FAF9',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4ECE7',
    marginBottom: 14,
  },
  radiusHeroNum: {
    fontSize: 32,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: -0.6,
  },
  radiusHeroSub: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '700',
    marginTop: 2,
  },
  presetChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  presetChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F7FAFB',
    borderWidth: 1,
    borderColor: ui.border,
  },
  presetChipActive: {
    backgroundColor: ui.teal,
    borderColor: ui.tealDark,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  presetTextActive: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 4,
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
    minHeight: 64,
    textAlignVertical: 'top',
  },
  inputHelp: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 6,
    lineHeight: 14,
  },
  townsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  townItem: {
    backgroundColor: '#F5FAF9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4ECE7',
  },
  townItemActive: {
    backgroundColor: ui.teal,
    borderColor: ui.tealDark,
  },
  townText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  townTextActive: {
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
