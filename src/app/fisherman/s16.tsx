import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { TripCatchRecord } from '@/types';

const SPECIES_PRESETS = [
  { name: 'Yellowfin Tuna (Kelawalla)', pricePerKg: 1800 },
  { name: 'Skipjack (Balaya)', pricePerKg: 750 },
  { name: 'Red Snapper (Galmalu)', pricePerKg: 1400 },
  { name: 'Sailfish (Thalapath)', pricePerKg: 1950 },
  { name: 'Seer Fish (Tora)', pricePerKg: 2800 },
  { name: 'Paraw (Carangid)', pricePerKg: 1300 },
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
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { trips, addTripCatch } = useFisherman();

  const trip = trips.find((t) => t.id === tripId) || trips[0];

  const [selectedSpecies, setSelectedSpecies] = useState(SPECIES_PRESETS[0].name);
  const [customSpecies, setCustomSpecies] = useState('');
  const [weightKgText, setWeightKgText] = useState('25.0');
  const [selectedGrade, setSelectedGrade] = useState(GRADES[0]);
  const [selectedStorage, setSelectedStorage] = useState(STORAGE_METHODS[0]);

  if (!trip) {
    return (
      <FishermanShell
        back
        title="S16 · Log Catch"
        subtitle="Trip not found"
        onBack={() => router.replace('/fisherman/trips')}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Trip Record Not Found</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/fisherman/trips')}
            style={styles.saveBtn}
          >
            <Text style={styles.saveBtnText}>Back to Trips (S11)</Text>
          </Pressable>
        </View>
      </FishermanShell>
    );
  }

  const weightKg = parseFloat(weightKgText) || 0;
  const currentPreset = SPECIES_PRESETS.find((s) => s.name === selectedSpecies);
  const unitPrice = currentPreset ? currentPreset.pricePerKg : 1200;
  const estimatedValue = Math.round(weightKg * unitPrice);

  const handleAddWeight = (increment: number) => {
    const cur = parseFloat(weightKgText) || 0;
    setWeightKgText(Math.max(1, cur + increment).toFixed(1));
  };

  const handleSaveCatch = () => {
    const finalSpecies = customSpecies.trim() ? customSpecies.trim() : selectedSpecies;

    if (weightKg <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid catch weight in kilograms.');
      return;
    }

    const newRecord: TripCatchRecord = {
      id: generateCatchId(),
      species: finalSpecies,
      weightKg,
      grade: selectedGrade,
      storageMethod: selectedStorage,
      recordedAt: 'Just now',
      estimatedValue,
    };

    addTripCatch(trip.id, newRecord);

    Alert.alert(
      'Catch Recorded (S16)',
      `Added ${weightKg} kg of ${finalSpecies} to voyage ${trip.tripNumber}.\nEstimated value: ${money(estimatedValue)}.`,
      [
        {
          text: 'View Trip Details (S13)',
          onPress: () => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } }),
        },
      ],
    );
  };

  return (
    <FishermanShell
      title={`S16 · Log Catch (${trip.tripNumber})`}
      subtitle="Record landed species haul & storage bin"
      back
      onBack={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S16</Text>
        </View>
        <Text numberOfLines={1} style={styles.helperText}>
          Add landed fish harvest to voyage {trip.tripNumber}
        </Text>
      </View>

      {/* FORM CARD */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Fish Species</Text>

        <View style={styles.presetChipsWrap}>
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
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* CUSTOM SPECIES INPUT */}
        <Text style={[styles.label, { marginTop: 12 }]}>OR CUSTOM FISH NAME</Text>
        <TextInput
          value={customSpecies}
          onChangeText={setCustomSpecies}
          placeholder="e.g. Swordfish (Koppara) or Mud Crab"
          placeholderTextColor={ui.muted}
          style={styles.input}
        />

        {/* WEIGHT INPUT */}
        <Text style={[styles.label, { marginTop: 14 }]}>CATCH WEIGHT (KG)</Text>
        <View style={styles.weightRow}>
          <TextInput
            value={weightKgText}
            onChangeText={setWeightKgText}
            keyboardType="numeric"
            style={styles.weightInput}
            placeholder="0.0"
          />
          <View style={styles.unitBox}>
            <Text style={styles.unitText}>KG</Text>
          </View>
        </View>

        {/* QUICK INCREMENT BUTTONS */}
        <View style={styles.incRow}>
          {[+5, +10, +25, +50].map((inc) => (
            <Pressable
              key={inc}
              accessibilityRole="button"
              onPress={() => handleAddWeight(inc)}
              style={styles.incBtn}
            >
              <Text style={styles.incBtnText}>+{inc} kg</Text>
            </Pressable>
          ))}
        </View>

        {/* QUALITY GRADE SELECTOR */}
        <Text style={[styles.label, { marginTop: 14 }]}>QUALITY GRADE</Text>
        <View style={styles.optionsCol}>
          {GRADES.map((grade) => (
            <Pressable
              key={grade}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedGrade === grade }}
              onPress={() => setSelectedGrade(grade)}
              style={[styles.optionRow, selectedGrade === grade && styles.optionRowActive]}
            >
              <View style={[styles.radioCircle, selectedGrade === grade && styles.radioCircleActive]}>
                {selectedGrade === grade ? <View style={styles.radioInner} /> : null}
              </View>
              <Text style={[styles.optionText, selectedGrade === grade && styles.optionTextActive]}>
                {grade}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* STORAGE METHOD */}
        <Text style={[styles.label, { marginTop: 14 }]}>STORAGE HOLD / BIN</Text>
        <View style={styles.optionsCol}>
          {STORAGE_METHODS.map((method) => (
            <Pressable
              key={method}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedStorage === method }}
              onPress={() => setSelectedStorage(method)}
              style={[styles.optionRow, selectedStorage === method && styles.optionRowActive]}
            >
              <View style={[styles.radioCircle, selectedStorage === method && styles.radioCircleActive]}>
                {selectedStorage === method ? <View style={styles.radioInner} /> : null}
              </View>
              <Text style={[styles.optionText, selectedStorage === method && styles.optionTextActive]}>
                {method}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ESTIMATED VALUE CALLOUT */}
        <View style={styles.estValueBox}>
          <Text style={styles.estValueLabel}>ESTIMATED HARBOR VALUE</Text>
          <Text style={styles.estValueAmount}>{money(estimatedValue)}</Text>
          <Text style={styles.estValueSub}>
            Based on ~Rs. {unitPrice.toLocaleString()}/kg current wholesale rate
          </Text>
        </View>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actionsCol}>
        <Pressable
          accessibilityRole="button"
          onPress={handleSaveCatch}
          style={styles.saveBtn}
        >
          <FishermanIcon name="plus" size={15} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Catch Record → S13</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
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
    marginBottom: 12,
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
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 10,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  presetChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#F0F9FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CDE5EB',
  },
  chipActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 12,
    color: ui.navy,
    fontWeight: '700',
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightInput: {
    flex: 1,
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
  },
  unitBox: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.tealDark,
  },
  incRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  incBtn: {
    flex: 1,
    backgroundColor: '#F0F9FA',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDE5EB',
  },
  incBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  optionsCol: {
    gap: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ui.border,
    gap: 8,
  },
  optionRowActive: {
    backgroundColor: '#F0F9FA',
    borderColor: ui.tealDark,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: ui.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: ui.tealDark,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ui.tealDark,
  },
  optionText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
    flex: 1,
  },
  optionTextActive: {
    color: ui.tealDark,
    fontWeight: '800',
  },
  estValueBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  estValueLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  estValueAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  estValueSub: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },
  actionsCol: {
    gap: 10,
    marginBottom: 30,
  },
  saveBtn: {
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
  saveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: ui.surface,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: ui.navy,
  },
});
