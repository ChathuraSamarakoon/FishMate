import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { TripCatchRecord } from '@/types';

const SPECIES_PRESETS = [
  { name: 'Yellowfin Tuna (Kelawalla)', pricePerKg: 1800, emoji: '🐟' },
  { name: 'Spanish Mackerel (Tora)', pricePerKg: 2400, emoji: '🐟' },
  { name: 'Spotted Sardines (Hurulla)', pricePerKg: 650, emoji: '🐟' },
  { name: 'Skipjack (Balaya)', pricePerKg: 750, emoji: '🐟' },
  { name: 'Red Snapper (Galmalu)', pricePerKg: 1400, emoji: '🐟' },
  { name: 'Sailfish (Thalapath)', pricePerKg: 1950, emoji: '🐟' },
];

const GRADES = [
  'Grade A (Sashimi Export)',
  'Grade A (Fresh Table Market)',
  'Grade B (Commercial / Processing)',
];

const STORAGE_METHODS = [
  'Cold Ice Bin #1 (Flake Ice)',
  'Crushed Ice Bin #2',
  'Chilled Seawater Slurry',
  'Deep Freezer Hold',
];

function generateCatchId() {
  return `catch-${Date.now()}`;
}

export default function S16AddCatchScreen() {
  const { tripId, catchId, from } = useLocalSearchParams<{
    tripId?: string;
    catchId?: string;
    from?: string;
  }>();
  const { trips, addTripCatch, updateTripCatch } = useFisherman();

  // 01. PRESELECTED TRIP
  const trip = trips.find((t) => t.id === tripId) || trips[0];
  const existingCatch = trip?.catches?.find((c) => c.id === catchId);
  const isEditing = Boolean(existingCatch);

  const matchedPreset = existingCatch
    ? SPECIES_PRESETS.find((s) => s.name === existingCatch.species)
    : SPECIES_PRESETS[0];

  // 01. FORM STATES
  const [selectedSpecies, setSelectedSpecies] = useState(
    matchedPreset ? matchedPreset.name : SPECIES_PRESETS[0].name,
  );
  const [customSpecies, setCustomSpecies] = useState(
    existingCatch && !matchedPreset ? existingCatch.species : '',
  );
  const [quantityKgText, setQuantityKgText] = useState(
    existingCatch ? String(existingCatch.weightKg) : '25.0',
  );
  const [selectedGrade, setSelectedGrade] = useState(
    existingCatch?.grade || GRADES[0],
  );
  const [selectedStorage, setSelectedStorage] = useState(
    existingCatch?.storageMethod || STORAGE_METHODS[0],
  );

  // 03. VALIDATION ERROR STATE
  const [qtyError, setQtyError] = useState('');

  if (!trip) {
    return (
      <View style={styles.sheetBackdrop}>
        <View style={styles.sheetContainer}>
          <Text style={styles.sheetTitle}>Trip Not Found</Text>
          <Text style={styles.sheetSubtitle}>The selected fishing voyage could not be found.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/fisherman/trips')}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Back to Trips (S11)</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Preselected trip totals calculation
  const currentTotalCaughtKg = trip.catches?.reduce((sum, c) => sum + c.weightKg, 0) || trip.catchVolumeKg || 0;
  const quantityKg = parseFloat(quantityKgText) || 0;

  // New projected total after adding or editing this catch
  const projectedTotalKg = isEditing && existingCatch
    ? Math.max(0, currentTotalCaughtKg - existingCatch.weightKg + (quantityKg > 0 ? quantityKg : 0))
    : currentTotalCaughtKg + (quantityKg > 0 ? quantityKg : 0);

  // Benchmark estimation
  const currentPreset = SPECIES_PRESETS.find((s) => s.name === selectedSpecies);
  const unitPrice = currentPreset ? currentPreset.pricePerKg : 1200;
  const estimatedValue = Math.round(quantityKg * unitPrice);

  // Stepper handlers
  const handleAddQty = (increment: number) => {
    const cur = parseFloat(quantityKgText) || 0;
    const next = Math.max(1, cur + increment);
    setQuantityKgText(next.toFixed(1));
    if (next > 0) setQtyError('');
  };

  // 02. CANCEL -> PREVIOUS ACTION
  const handleCancel = () => {
    if (from === 's13') {
      router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } });
    } else if (from === 's15' || !from) {
      router.replace({ pathname: '/fisherman/s15' as never, params: { tripId: trip.id } });
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: '/fisherman/s15' as never, params: { tripId: trip.id } });
    }
  };

  // 02. SAVE CATCH -> S15 / S13
  const handleSaveCatch = () => {
    const finalSpecies = customSpecies.trim() ? customSpecies.trim() : selectedSpecies;

    // 03. BEHAVIOR & VALIDATION: Positive Quantity Validation (> 0)
    if (quantityKg <= 0 || isNaN(quantityKg)) {
      setQtyError('Quantity caught must be a positive number greater than 0 kg.');
      Alert.alert(
        'Positive Quantity Required',
        'Please enter a valid positive catch weight in kilograms (e.g. 25.0 kg).',
      );
      return;
    }
    setQtyError('');

    if (isEditing && catchId) {
      updateTripCatch(trip.id, catchId, {
        species: finalSpecies,
        weightKg: quantityKg,
        grade: selectedGrade,
        storageMethod: selectedStorage,
        estimatedValue,
      });

      Alert.alert(
        'Catch Updated (S16)',
        `Updated ${finalSpecies} to ${quantityKg.toFixed(1)} kg on ${trip.tripNumber}.\nTrip total yield updated to ${projectedTotalKg.toFixed(1)} kg.`,
        [
          {
            text: from === 's13' ? 'View Trip Details (S13)' : 'View Catch Records (S15)',
            onPress: () => {
              if (from === 's13') {
                router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } });
              } else {
                router.replace({ pathname: '/fisherman/s15' as never, params: { tripId: trip.id } });
              }
            },
          },
        ],
      );
    } else {
      const newRecord: TripCatchRecord = {
        id: generateCatchId(),
        species: finalSpecies,
        weightKg: quantityKg,
        grade: selectedGrade,
        storageMethod: selectedStorage,
        recordedAt: 'Just now',
        estimatedValue,
      };

      addTripCatch(trip.id, newRecord);

      Alert.alert(
        'Catch Recorded (S16)',
        `Added ${quantityKg.toFixed(1)} kg of ${finalSpecies} to voyage ${trip.tripNumber}.\nTotal harvest increased to ${projectedTotalKg.toFixed(1)} kg.`,
        [
          {
            text: from === 's13' ? 'View Trip Details (S13)' : 'View Catch Records (S15)',
            onPress: () => {
              if (from === 's13') {
                router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } });
              } else {
                router.replace({ pathname: '/fisherman/s15' as never, params: { tripId: trip.id } });
              }
            },
          },
        ],
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.sheetBackdrop}
    >
      {/* SEMI-TRANSPARENT BACKDROP (TAP TO CANCEL) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss Modal"
        onPress={handleCancel}
        style={styles.backdropDismissArea}
      />

      {/* BOTTOM-SHEET MODAL CONTAINER */}
      <View style={styles.sheetContainer}>
        {/* GRAB HANDLE PILL */}
        <View style={styles.grabHandle} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER ROW WITH CANCEL BUTTON */}
          <View style={styles.sheetHeaderRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.screenTagRow}>
                <View style={styles.screenTag}>
                  <Text style={styles.screenTagText}>SCREEN S16</Text>
                </View>
                <Text style={styles.sheetSubBadge}>
                  {isEditing ? 'EDIT CATCH' : 'BOTTOM-SHEET CATCH LOGGER'}
                </Text>
              </View>
              <Text numberOfLines={1} style={styles.sheetTitle}>
                {isEditing ? `Edit Catch Record` : `Log Landed Catch`}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel and close"
              onPress={handleCancel}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* 01. PRESELECTED TRIP BANNER */}
          <View style={styles.preselectedTripCard}>
            <View style={styles.tripIconWrap}>
              <FishermanIcon name="boat" size={16} color={ui.tealDark} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={styles.tripNameText}>
                Voyage {trip.tripNumber} · {trip.boatName}
              </Text>
              <Text numberOfLines={1} style={styles.tripLocationText}>
                📍 {trip.harbor} · 📅 {trip.tripDate || trip.departureDate.split(',')[0]}
              </Text>
            </View>
            <View style={styles.tripCurrentYieldPill}>
              <Text style={styles.yieldPillLabel}>CURRENT</Text>
              <Text style={styles.yieldPillValue}>{currentTotalCaughtKg.toFixed(1)} KG</Text>
            </View>
          </View>

          {/* 01. FISH TYPE SELECTOR */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionHeading}>1. Select Fish Type</Text>
            <View style={styles.speciesPresetGrid}>
              {SPECIES_PRESETS.map((item) => {
                const isSelected = selectedSpecies === item.name && !customSpecies;
                return (
                  <Pressable
                    key={item.name}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      setSelectedSpecies(item.name);
                      setCustomSpecies('');
                    }}
                    style={[styles.speciesChip, isSelected && styles.speciesChipActive]}
                  >
                    <Text style={styles.speciesChipEmoji}>{item.emoji}</Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.speciesChipText, isSelected && styles.speciesChipTextActive]}
                    >
                      {item.name.split(' (')[0]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* CUSTOM FISH TYPE INPUT */}
            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>OR CUSTOM FISH SPECIES</Text>
            <View style={styles.textInputWrap}>
              <FishermanIcon name="sparkles" size={14} color={ui.tealDark} />
              <TextInput
                value={customSpecies}
                onChangeText={setCustomSpecies}
                placeholder="e.g. Swordfish (Koppara) or Mud Crab"
                placeholderTextColor={ui.muted}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* 01. QUANTITY CAUGHT (KG) */}
          <View style={styles.formSection}>
            <View style={styles.qtyHeaderRow}>
              <Text style={styles.formSectionHeading}>2. Quantity Caught (KG)</Text>
              <Text style={styles.positiveBadge}>Positive Number Required</Text>
            </View>

            <View style={[styles.qtyInputRow, qtyError ? styles.qtyInputRowError : null]}>
              <TextInput
                value={quantityKgText}
                onChangeText={(txt) => {
                  setQuantityKgText(txt);
                  const num = parseFloat(txt);
                  if (num > 0) {
                    setQtyError('');
                  }
                }}
                keyboardType="numeric"
                style={styles.qtyInput}
                placeholder="0.0"
                placeholderTextColor={ui.muted}
              />
              <View style={styles.kgBadge}>
                <Text style={styles.kgBadgeText}>KG</Text>
              </View>
            </View>

            {/* 03. POSITIVE QUANTITY VALIDATION ERROR */}
            {qtyError ? (
              <View style={styles.errorStrip}>
                <FishermanIcon name="alert" size={13} color="#DC2626" />
                <Text style={styles.errorStripText}>{qtyError}</Text>
              </View>
            ) : null}

            {/* QUICK STEPPER BUTTONS */}
            <View style={styles.stepperRow}>
              {[+5, +10, +25, +50].map((step) => (
                <Pressable
                  key={step}
                  accessibilityRole="button"
                  onPress={() => handleAddQty(step)}
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepBtnText}>+{step} kg</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 03. CATCH TOTALS UPDATE PREVIEW BANNER */}
          <View style={styles.totalsUpdateBanner}>
            <View style={styles.totalsUpdateRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.totalsUpdateLabel}>UPDATED TRIP TOTAL HARVEST</Text>
                <Text style={styles.totalsUpdateValue}>
                  {projectedTotalKg.toFixed(1)} KG
                </Text>
              </View>
              <View style={styles.totalsDivider} />
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.totalsUpdateLabel}>BATCH ESTIMATED VALUE</Text>
                <Text style={styles.totalsValueTeal}>
                  {money(estimatedValue)}
                </Text>
              </View>
            </View>
            <Text style={styles.totalsUpdateSub}>
              📈 Saving this batch immediately updates total catch yield on S13 & S15
            </Text>
          </View>

          {/* QUALITY GRADE & STORAGE (COLLAPSIBLE / COMPACT) */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>QUALITY GRADE</Text>
            <View style={styles.optionsWrap}>
              {GRADES.map((grade) => (
                <Pressable
                  key={grade}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedGrade === grade }}
                  onPress={() => setSelectedGrade(grade)}
                  style={[styles.gradeChip, selectedGrade === grade && styles.gradeChipActive]}
                >
                  <Text
                    style={[styles.gradeChipText, selectedGrade === grade && styles.gradeChipTextActive]}
                  >
                    {grade}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>STORAGE BIN / METHOD</Text>
            <View style={styles.optionsWrap}>
              {STORAGE_METHODS.map((method) => (
                <Pressable
                  key={method}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedStorage === method }}
                  onPress={() => setSelectedStorage(method)}
                  style={[styles.gradeChip, selectedStorage === method && styles.gradeChipActive]}
                >
                  <Text
                    style={[styles.gradeChipText, selectedStorage === method && styles.gradeChipTextActive]}
                  >
                    {method}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 02. BUTTONS & ACTIONS */}
          <View style={styles.actionCol}>
            <Pressable
              accessibilityRole="button"
              onPress={handleSaveCatch}
              style={styles.primaryBtn}
            >
              <FishermanIcon name="check" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>
                {isEditing ? 'Save Catch Changes → S15' : 'Save Catch → S15 / S13'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleCancel}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel (Previous)</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // BOTTOM-SHEET BACKDROP
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropDismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 24,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  grabHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // HEADER ROW
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  screenTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  screenTag: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  screenTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.6,
  },
  sheetSubBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.muted,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: ui.muted,
    marginBottom: 14,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: ui.navy,
  },

  // PRESELECTED TRIP CARD
  preselectedTripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2F0F3',
    marginBottom: 14,
    gap: 10,
  },
  tripIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripNameText: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  tripLocationText: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '600',
    marginTop: 1,
  },
  tripCurrentYieldPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: ui.border,
  },
  yieldPillLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: ui.muted,
  },
  yieldPillValue: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.tealDark,
  },

  // FORM SECTIONS
  formSection: {
    marginBottom: 14,
  },
  formSectionHeading: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  speciesPresetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  speciesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ui.border,
    gap: 4,
  },
  speciesChipActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  speciesChipEmoji: {
    fontSize: 12,
  },
  speciesChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
  },
  speciesChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  textInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: ui.navy,
  },

  // QUANTITY INPUT
  qtyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  positiveBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  qtyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ui.border,
    paddingHorizontal: 14,
    height: 52,
  },
  qtyInputRowError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  qtyInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
    color: ui.navy,
  },
  kgBadge: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  kgBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.tealDark,
  },
  errorStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  errorStripText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  stepBtn: {
    flex: 1,
    backgroundColor: '#F0F9FA',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDE5EB',
  },
  stepBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },

  // TOTALS PREVIEW BANNER
  totalsUpdateBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 14,
  },
  totalsUpdateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalsUpdateLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.6,
  },
  totalsUpdateValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  totalsValueTeal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#047857',
    marginTop: 2,
  },
  totalsDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#A7F3D0',
    marginHorizontal: 10,
  },
  totalsUpdateSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#047857',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },

  // OPTIONS WRAP
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gradeChip: {
    backgroundColor: '#F8FCFD',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ui.border,
  },
  gradeChipActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  gradeChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.navy,
  },
  gradeChipTextActive: {
    color: '#0369A1',
    fontWeight: '800',
  },

  // BUTTONS & ACTIONS
  actionCol: {
    gap: 8,
    marginTop: 6,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: ui.tealDark,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: '#F8FCFD',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
  },
});
