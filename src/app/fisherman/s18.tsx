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
import type { TripExpenseRecord } from '@/types';

type ExpenseCategory = 'fuel' | 'ice' | 'bait' | 'harbor' | 'food' | 'maintenance' | 'other';

const CATEGORIES: { label: string; value: ExpenseCategory; defaultTitle: string; emoji: string }[] = [
  { label: 'Fuel (Diesel)', value: 'fuel', defaultTitle: 'Diesel Fuel (45 Litres)', emoji: '⛽' },
  { label: 'Crushed Ice', value: 'ice', defaultTitle: 'Crushed Ice (6 Crates)', emoji: '🧊' },
  { label: 'Crew Food', value: 'food', defaultTitle: 'Crew Meals & Drinking Water', emoji: '🍲' },
  { label: 'Boat Costs', value: 'maintenance', defaultTitle: 'Net Mending & Engine Oil', emoji: '⛵' },
  { label: 'Harbor Slip', value: 'harbor', defaultTitle: 'Harbor Gate & Berthing Levy', emoji: '⚓' },
  { label: 'Fresh Bait', value: 'bait', defaultTitle: 'Squid & Sardine Bait', emoji: '🐟' },
  { label: 'Other', value: 'other', defaultTitle: 'General Voyage Supplies', emoji: '📦' },
];

function generateExpenseId() {
  return `exp-${Date.now()}`;
}

export default function S18AddExpenseScreen() {
  const { tripId, expenseId, from } = useLocalSearchParams<{
    tripId?: string;
    expenseId?: string;
    from?: string;
  }>();
  const { trips, addTripExpense, updateTripExpense } = useFisherman();

  // 01. SELECTED TRIP
  const trip = trips.find((t) => t.id === tripId) || trips[0];
  const existingExpense = trip?.expensesList?.find((e) => e.id === expenseId);
  const isEditing = Boolean(existingExpense);

  const [selectedCat, setSelectedCat] = useState<ExpenseCategory>(
    existingExpense?.category || 'fuel',
  );
  const [title, setTitle] = useState(
    existingExpense?.title || CATEGORIES[0].defaultTitle,
  );
  const [amountText, setAmountText] = useState(
    existingExpense ? String(existingExpense.amount) : '5000',
  );
  const [receiptNote, setReceiptNote] = useState(
    existingExpense?.receiptNote || 'Harbor Gate 01 Slip #3910',
  );

  // 03. VALIDATION ERROR STATE
  const [amountError, setAmountError] = useState('');

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

  const currentTotalExpenses = trip.expensesList && trip.expensesList.length > 0
    ? trip.expensesList.reduce((sum, e) => sum + e.amount, 0)
    : (trip.fuelCost || 0) + (trip.iceBaitCost || 0) + (trip.otherCost || 0);

  const amount = parseFloat(amountText) || 0;

  // 03. TRIP TOTAL EXPENSES RECALCULATE PREVIEW
  const projectedTotalExpenses = isEditing && existingExpense
    ? Math.max(0, currentTotalExpenses - existingExpense.amount + (amount > 0 ? amount : 0))
    : currentTotalExpenses + (amount > 0 ? amount : 0);

  const tripRevenue = trip.salesList && trip.salesList.length > 0
    ? trip.salesList.reduce((sum, s) => sum + s.totalAmount, 0)
    : trip.revenue || 0;

  const projectedNetProfit = tripRevenue - projectedTotalExpenses;

  const handleSelectCategory = (cat: ExpenseCategory) => {
    setSelectedCat(cat);
    const found = CATEGORIES.find((c) => c.value === cat);
    if (found && !isEditing) {
      setTitle(found.defaultTitle);
    }
  };

  const handleAddAmount = (inc: number) => {
    const cur = parseFloat(amountText) || 0;
    const next = Math.max(0, cur + inc);
    setAmountText(next.toString());
    if (next > 0) setAmountError('');
  };

  // 02. CANCEL -> PREVIOUS ACTION
  const handleCancel = () => {
    if (from === 's13') {
      router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } });
    } else if (from === 's17' || !from) {
      router.replace({ pathname: '/fisherman/s17' as never, params: { tripId: trip.id } });
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: '/fisherman/s17' as never, params: { tripId: trip.id } });
    }
  };

  // 02. SAVE EXPENSE -> S17 / S13
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a description / title for this expense voucher.');
      return;
    }

    // 03. BEHAVIOR & VALIDATION: Positive numeric amount required (> 0)
    if (amount <= 0 || isNaN(amount)) {
      setAmountError('Expense amount must be a positive numeric value greater than Rs. 0.');
      Alert.alert(
        'Positive Amount Required',
        'Please enter a valid positive numeric amount in LKR (e.g. 5,000).',
      );
      return;
    }
    setAmountError('');

    if (isEditing && expenseId) {
      updateTripExpense(trip.id, expenseId, {
        category: selectedCat,
        title: title.trim(),
        amount,
        receiptNote: receiptNote.trim() || undefined,
      });

      Alert.alert(
        'Expense Updated (S18)',
        `Updated "${title.trim()}" to ${money(amount)} for voyage ${trip.tripNumber}.\nTrip total expenses recalculated to ${money(projectedTotalExpenses)}.`,
        [
          {
            text: from === 's13' ? 'View Trip Details (S13)' : 'View Expenses (S17)',
            onPress: () => {
              if (from === 's13') {
                router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } });
              } else {
                router.replace({ pathname: '/fisherman/s17' as never, params: { tripId: trip.id } });
              }
            },
          },
        ],
      );
    } else {
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
        'Expense Recorded (S18)',
        `Deduction of ${money(amount)} for "${title.trim()}" logged to voyage ${trip.tripNumber}.\nTotal operational deductions: ${money(projectedTotalExpenses)}.`,
        [
          {
            text: from === 's13' ? 'View Trip Details (S13)' : 'View Expenses (S17)',
            onPress: () => {
              if (from === 's13') {
                router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } });
              } else {
                router.replace({ pathname: '/fisherman/s17' as never, params: { tripId: trip.id } });
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
                  <Text style={styles.screenTagText}>SCREEN S18</Text>
                </View>
                <Text style={styles.sheetSubBadge}>
                  {isEditing ? 'EDIT EXPENSE VOUCHER' : 'BOTTOM-SHEET EXPENSE LOGGER'}
                </Text>
              </View>
              <Text numberOfLines={1} style={styles.sheetTitle}>
                {isEditing ? 'Edit Voyage Expense' : 'Log Operational Expense'}
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

          {/* 01. SELECTED TRIP BANNER */}
          <View style={styles.selectedTripCard}>
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
            <View style={styles.tripCurrentExpPill}>
              <Text style={styles.expPillLabel}>CURRENT COSTS</Text>
              <Text style={styles.expPillValue}>- {money(currentTotalExpenses)}</Text>
            </View>
          </View>

          {/* 01. EXPENSE TYPE SELECTOR */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionHeading}>1. Expense Category & Type</Text>
            <View style={styles.catGrid}>
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
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.catText, isSelected && styles.catTextActive]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* EXPENSE TITLE / DESCRIPTION */}
            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>EXPENSE DESCRIPTION / TITLE</Text>
            <View style={styles.textInputWrap}>
              <FishermanIcon name="sparkles" size={14} color={ui.tealDark} />
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Diesel fuel 45L or Crushed Ice"
                placeholderTextColor={ui.muted}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* 01. AMOUNT (RS.) */}
          <View style={styles.formSection}>
            <View style={styles.amountHeaderRow}>
              <Text style={styles.formSectionHeading}>2. Amount (Rs.)</Text>
              <Text style={styles.positiveBadge}>Positive Amount Required</Text>
            </View>

            <View style={[styles.amountInputRow, amountError ? styles.amountInputRowError : null]}>
              <View style={styles.currPrefixBox}>
                <Text style={styles.currPrefixText}>Rs.</Text>
              </View>
              <TextInput
                value={amountText}
                onChangeText={(txt) => {
                  setAmountText(txt);
                  const num = parseFloat(txt);
                  if (num > 0) {
                    setAmountError('');
                  }
                }}
                keyboardType="numeric"
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor={ui.muted}
              />
            </View>

            {/* 03. POSITIVE AMOUNT ERROR BANNER */}
            {amountError ? (
              <View style={styles.errorStrip}>
                <FishermanIcon name="alert" size={13} color="#DC2626" />
                <Text style={styles.errorStripText}>{amountError}</Text>
              </View>
            ) : null}

            {/* QUICK INCREMENT BUTTONS */}
            <View style={styles.stepperRow}>
              {[+1000, +2500, +5000, +10000].map((inc) => (
                <Pressable
                  key={inc}
                  accessibilityRole="button"
                  onPress={() => handleAddAmount(inc)}
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepBtnText}>+{inc.toLocaleString()}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 01. NOTES (OPTIONAL) */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>3. NOTES / RECEIPT NUMBER (OPTIONAL)</Text>
            <View style={styles.textInputWrap}>
              <FishermanIcon name="pin" size={14} color={ui.tealDark} />
              <TextInput
                value={receiptNote}
                onChangeText={setReceiptNote}
                placeholder="e.g. Lanka IOC Station Slip #3910, Berth A slip"
                placeholderTextColor={ui.muted}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* 03. TRIP TOTAL EXPENSES RECALCULATE PREVIEW */}
          <View style={styles.recalcBanner}>
            <View style={styles.recalcRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.recalcLabel}>RECALCULATED TRIP EXPENSES</Text>
                <Text style={styles.recalcAmount}>- {money(projectedTotalExpenses)}</Text>
              </View>
              <View style={styles.recalcDivider} />
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.recalcLabel}>PROJECTED NET PROFIT</Text>
                <Text
                  style={[
                    styles.recalcProfit,
                    projectedNetProfit >= 0 ? styles.recalcProfitPositive : styles.recalcProfitNegative,
                  ]}
                >
                  {projectedNetProfit >= 0 ? `+ ${money(projectedNetProfit)}` : `- ${money(Math.abs(projectedNetProfit))}`}
                </Text>
              </View>
            </View>
            <Text style={styles.recalcSub}>
              📐 Net Profit = Gross Sales ({money(tripRevenue)}) − Recalculated Expenses ({money(projectedTotalExpenses)})
            </Text>
          </View>

          {/* 02. BUTTONS & ACTIONS */}
          <View style={styles.actionCol}>
            <Pressable
              accessibilityRole="button"
              onPress={handleSave}
              style={styles.primaryBtn}
            >
              <FishermanIcon name="check" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>
                {isEditing ? 'Save Expense Changes → S17' : 'Save Expense → S17 / S13'}
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
  // BOTTOM-SHEET MODAL BACKDROP
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

  // SELECTED TRIP BANNER
  selectedTripCard: {
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
  tripCurrentExpPill: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  expPillLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#991B1B',
  },
  expPillValue: {
    fontSize: 11,
    fontWeight: '900',
    color: '#DC2626',
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
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
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
  catChipActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  catEmoji: {
    fontSize: 12,
  },
  catText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
  },
  catTextActive: {
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

  // AMOUNT INPUT
  amountHeaderRow: {
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
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ui.border,
    height: 52,
    overflow: 'hidden',
  },
  amountInputRowError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  currPrefixBox: {
    backgroundColor: '#FEE2E2',
    height: '100%',
    paddingHorizontal: 14,
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
    fontSize: 22,
    fontWeight: '900',
    color: '#DC2626',
    paddingHorizontal: 12,
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
    backgroundColor: '#FEF2F2',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  stepBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },

  // RECALCULATE PREVIEW BANNER
  recalcBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 14,
  },
  recalcRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recalcLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 0.6,
  },
  recalcAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
    marginTop: 2,
  },
  recalcProfit: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  recalcProfitPositive: {
    color: '#059669',
  },
  recalcProfitNegative: {
    color: '#DC2626',
  },
  recalcDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#FECACA',
    marginHorizontal: 10,
  },
  recalcSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7F1D1D',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
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
