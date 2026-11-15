import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { TripExpenseRecord } from '@/types';

type ExpenseCategory = 'fuel' | 'ice' | 'bait' | 'harbor' | 'food' | 'maintenance' | 'other';

const CATEGORIES: { label: string; value: ExpenseCategory; defaultTitle: string; icon: string }[] = [
  { label: '⛽ Fuel (Diesel)', value: 'fuel', defaultTitle: 'Diesel Fuel (30 Litres)', icon: 'tag' },
  { label: '🧊 Crushed Ice', value: 'ice', defaultTitle: 'Crushed Ice (4 Crates)', icon: 'sparkles' },
  { label: '🐟 Fresh Bait', value: 'bait', defaultTitle: 'Sardine & Squid Bait', icon: 'boat' },
  { label: '⚓ Harbor Levy', value: 'harbor', defaultTitle: 'Harbor Gate & Berthing Levy', icon: 'pin' },
  { label: '🍲 Food & Crew', value: 'food', defaultTitle: 'Crew Meals & Drinking Water', icon: 'tag' },
  { label: '🔧 Maintenance', value: 'maintenance', defaultTitle: 'Net Repair & Engine Oil', icon: 'alert-circle' },
];

function generateExpenseId() {
  return `exp-${Date.now()}`;
}

export default function S18AddExpenseScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { trips, addTripExpense } = useFisherman();

  const trip = trips.find((t) => t.id === tripId) || trips[0];

  const [selectedCat, setSelectedCat] = useState<ExpenseCategory>('fuel');
  const [title, setTitle] = useState(CATEGORIES[0].defaultTitle);
  const [amountText, setAmountText] = useState('5000');
  const [receiptNote, setReceiptNote] = useState('Harbor Gate 01 Station');

  if (!trip) {
    return (
      <FishermanShell
        back
        title="S18 · Log Expense"
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

  const amount = parseFloat(amountText) || 0;

  const handleSelectCategory = (cat: ExpenseCategory) => {
    setSelectedCat(cat);
    const found = CATEGORIES.find((c) => c.value === cat);
    if (found) {
      setTitle(found.defaultTitle);
    }
  };

  const handleAddAmount = (inc: number) => {
    const cur = parseFloat(amountText) || 0;
    setAmountText(Math.max(0, cur + inc).toString());
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a description for this expense.');
      return;
    }

    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount in LKR.');
      return;
    }

    const newExpense: TripExpenseRecord = {
      id: generateExpenseId(),
      category: selectedCat,
      title: title.trim(),
      amount,
      receiptNote: receiptNote.trim() || undefined,
      recordedAt: 'Just now',
    };

    addTripExpense(trip.id, newExpense);

    Alert.alert(
      'Expense Logged (S18)',
      `Deduction of ${money(amount)} for "${title}" recorded to voyage ${trip.tripNumber}.`,
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
      title={`S18 · Log Expense (${trip.tripNumber})`}
      subtitle="Record operational costs & vouchers"
      back
      onBack={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S18</Text>
        </View>
        <Text numberOfLines={1} style={styles.helperText}>
          Add fuel, ice, bait, harbor slips to voyage {trip.tripNumber}
        </Text>
      </View>

      {/* FORM CARD */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Expense Category</Text>

        <View style={styles.catChipsWrap}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.value;
            return (
              <Pressable
                key={cat.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => handleSelectCategory(cat.value)}
                style={[styles.catChip, isSelected && styles.catChipActive]}
              >
                <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* EXPENSE TITLE */}
        <Text style={[styles.label, { marginTop: 14 }]}>EXPENSE DESCRIPTION / TITLE</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Diesel fuel 40L"
          placeholderTextColor={ui.muted}
          style={styles.input}
        />

        {/* AMOUNT IN LKR */}
        <Text style={[styles.label, { marginTop: 14 }]}>AMOUNT (LKR)</Text>
        <View style={styles.amountInputRow}>
          <View style={styles.currPrefix}>
            <Text style={styles.currPrefixText}>Rs.</Text>
          </View>
          <TextInput
            value={amountText}
            onChangeText={setAmountText}
            keyboardType="numeric"
            style={styles.amountInput}
            placeholder="0"
          />
        </View>

        {/* QUICK INCREMENT BUTTONS */}
        <View style={styles.incRow}>
          {[+1000, +2500, +5000, +10000].map((inc) => (
            <Pressable
              key={inc}
              accessibilityRole="button"
              onPress={() => handleAddAmount(inc)}
              style={styles.incBtn}
            >
              <Text style={styles.incBtnText}>+{inc.toLocaleString()}</Text>
            </Pressable>
          ))}
        </View>

        {/* RECEIPT NOTE */}
        <Text style={[styles.label, { marginTop: 14 }]}>RECEIPT / HARBOR SLIP NOTE (OPTIONAL)</Text>
        <TextInput
          value={receiptNote}
          onChangeText={setReceiptNote}
          placeholder="e.g. Lanka IOC Harbor Station Slip #3910"
          placeholderTextColor={ui.muted}
          style={styles.input}
        />

        {/* DEDUCTION SUMMARY */}
        <View style={styles.deductionCallout}>
          <Text style={styles.deductionLabel}>OPERATIONAL DEDUCTION</Text>
          <Text style={styles.deductionAmount}>- {money(amount)}</Text>
          <Text style={styles.deductionSub}>
            This expense will be deducted from voyage gross revenue to determine profit.
          </Text>
        </View>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actionsCol}>
        <Pressable
          accessibilityRole="button"
          onPress={handleSave}
          style={styles.saveBtn}
        >
          <FishermanIcon name="plus" size={15} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Record Expense → S13</Text>
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
  catChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
    backgroundColor: '#F8FCFD',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ui.border,
  },
  catChipActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
  },
  catChipTextActive: {
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
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currPrefix: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currPrefixText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#DC2626',
  },
  amountInput: {
    flex: 1,
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
  },
  incRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  incBtn: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  incBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  deductionCallout: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deductionLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 0.8,
  },
  deductionAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
    marginTop: 2,
  },
  deductionSub: {
    fontSize: 10,
    color: '#7F1D1D',
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
