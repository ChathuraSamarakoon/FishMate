import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { TripExpenseRecord } from '@/types';

type CategoryFilter = 'all' | 'fuel' | 'ice' | 'food' | 'boat' | 'other';

export default function S17ExpensesScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { trips, deleteTripExpense } = useFisherman();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  // Find target trip
  const trip = trips.find((t) => t.id === tripId) || trips[0];

  if (!trip) {
    return (
      <FishermanShell
        back
        title="S17 · Expenses"
        subtitle="Trip not found"
        onBack={() => router.replace('/fisherman/trips')}
      >
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>Trip Record Not Found</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/fisherman/trips')}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>Back to Trips (S11)</Text>
          </Pressable>
        </View>
      </FishermanShell>
    );
  }

  const expensesList: TripExpenseRecord[] = trip.expensesList ?? [];

  // 03. BEHAVIOR & VALIDATION: Totals update dynamically after changes
  const totalExpenses = expensesList.length > 0
    ? expensesList.reduce((sum, e) => sum + e.amount, 0)
    : (trip.fuelCost || 0) + (trip.iceBaitCost || 0) + (trip.otherCost || 0);

  // 03. CATEGORIES: fuel, ice, food, boat costs, other
  const fuelCost = expensesList
    .filter((e) => e.category === 'fuel')
    .reduce((sum, e) => sum + e.amount, 0) || trip.fuelCost || 0;

  const iceCost = expensesList
    .filter((e) => e.category === 'ice')
    .reduce((sum, e) => sum + e.amount, 0) || Math.round((trip.iceBaitCost || 0) * 0.65);

  const foodCost = expensesList
    .filter((e) => e.category === 'food')
    .reduce((sum, e) => sum + e.amount, 0);

  const boatCost = expensesList
    .filter((e) => e.category === 'maintenance' || e.category === 'harbor')
    .reduce((sum, e) => sum + e.amount, 0) || trip.otherCost || 0;

  const otherCost = expensesList
    .filter((e) => e.category === 'other' || e.category === 'bait')
    .reduce((sum, e) => sum + e.amount, 0);

  // Filtered expense list
  const filteredExpenses = expensesList.filter((e) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'fuel') return e.category === 'fuel';
    if (selectedCategory === 'ice') return e.category === 'ice';
    if (selectedCategory === 'food') return e.category === 'food';
    if (selectedCategory === 'boat') return e.category === 'maintenance' || e.category === 'harbor';
    if (selectedCategory === 'other') return e.category === 'other' || e.category === 'bait';
    return true;
  });

  // Navigation handlers
  const handleAddExpense = () => {
    router.push({ pathname: '/fisherman/s18' as never, params: { tripId: trip.id } });
  };

  const handleEditExpense = (expense: TripExpenseRecord) => {
    router.push({
      pathname: '/fisherman/s18' as never,
      params: { tripId: trip.id, expenseId: expense.id },
    });
  };

  const handleDeleteExpense = (expense: TripExpenseRecord) => {
    Alert.alert(
      'Remove Expense Voucher',
      `Are you sure you want to remove "${expense.title}" (- ${money(expense.amount)})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteTripExpense(trip.id, expense.id),
        },
      ],
    );
  };

  const handleExportLedger = () => {
    Alert.alert(
      'Export Expense Statement (S17)',
      `Generating complete operational deductions ledger for ${trip.tripNumber}.\n\nTotal Deductions: - ${money(totalExpenses)}\nVouchers Logged: ${expensesList.length}\n\nPDF exported to documents.`,
      [{ text: 'OK' }],
    );
  };

  const isCompleted = trip.status === 'completed';
  const isOngoing = trip.status === 'ongoing';

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'fuel':
        return { label: 'FUEL (DIESEL)', bg: '#FEF3C7', text: '#92400E' };
      case 'ice':
        return { label: 'CRUSHED ICE', bg: '#E0F2FE', text: '#0369A1' };
      case 'food':
        return { label: 'CREW FOOD', bg: '#DCFCE7', text: '#15803D' };
      case 'maintenance':
      case 'harbor':
        return { label: 'BOAT COSTS', bg: '#EDE9FE', text: '#6D28D9' };
      default:
        return { label: 'LOGISTICS / OTHER', bg: '#F3F4F6', text: '#374151' };
    }
  };

  return (
    <FishermanShell
      title={`S17 · ${trip.tripNumber} Expenses`}
      subtitle="Operational expenditure, fuel & harbor vouchers"
      back
      onBack={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
      rightIcon="sparkles"
      rightLabel="Ledger"
      onRightPress={handleExportLedger}
    >
      {/* SCREEN BREADCRUMB */}
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S17</Text>
        </View>
        <Text numberOfLines={1} style={styles.helperText}>
          Operational Expenses, Fuel Slips & Boat Logistics
        </Text>
      </View>

      {/* 01. TRIP INFORMATION CARD */}
      <View style={styles.tripInfoCard}>
        <View style={styles.tripInfoTopRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.tripNumberHeading}>{trip.tripNumber}</Text>
            <Text numberOfLines={1} style={styles.boatDetailsText}>
              ⛵ {trip.boatName} · 📍 {trip.harbor}
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              isCompleted
                ? styles.statusPillCompleted
                : isOngoing
                ? styles.statusPillOngoing
                : styles.statusPillPlanned,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                isCompleted
                  ? styles.statusTextCompleted
                  : isOngoing
                  ? styles.statusTextOngoing
                  : styles.statusTextPlanned,
              ]}
            >
              {isCompleted ? 'Completed ✓' : isOngoing ? 'At Sea ●' : 'Planned'}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.tripInfoBottomRow}>
          <Text style={styles.tripDateText}>
            📅 {trip.tripDate || trip.departureDate}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
            style={styles.tripLinkPill}
          >
            <Text style={styles.tripLinkText}>Trip Details (S13) →</Text>
          </Pressable>
        </View>
      </View>

      {/* 01 & 03. TOTAL EXPENSES CARD */}
      <View style={styles.totalExpensesCard}>
        <View style={styles.totalExpRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.totalExpLabel}>TOTAL OPERATIONAL EXPENSES</Text>
            <Text style={styles.totalExpAmount}>- {money(totalExpenses)}</Text>
            <Text style={styles.totalExpSub}>
              📐 Net Deductions across {expensesList.length} recorded vouchers
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleAddExpense}
            style={styles.addExpenseHeaderBtn}
          >
            <FishermanIcon name="plus" size={13} color="#FFFFFF" />
            <Text style={styles.addExpenseHeaderBtnText}>+ Add Expense (S18)</Text>
          </Pressable>
        </View>
      </View>

      {/* 01 & 03. EXPENSE CATEGORY BAR (fuel, ice, food, boat costs, other) */}
      <View style={styles.categoryFilterScroll}>
        {[
          { key: 'all', label: `All (${expensesList.length})` },
          { key: 'fuel', label: `⛽ Fuel (${money(fuelCost)})` },
          { key: 'ice', label: `🧊 Ice (${money(iceCost)})` },
          { key: 'food', label: `🍲 Food (${money(foodCost)})` },
          { key: 'boat', label: `⛵ Boat (${money(boatCost)})` },
          { key: 'other', label: `📦 Other (${money(otherCost)})` },
        ].map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <Pressable
              key={cat.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelectedCategory(cat.key as CategoryFilter)}
              style={[styles.categoryFilterChip, isSelected && styles.categoryFilterChipActive]}
            >
              <Text
                style={[
                  styles.categoryFilterChipText,
                  isSelected && styles.categoryFilterChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 01. EXPENSE RECORDS LIST */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.sectionTitle}>
          Itemized Vouchers ({filteredExpenses.length})
        </Text>
        <Text style={styles.sectionSub}>
          Filtered: {selectedCategory.toUpperCase()}
        </Text>
      </View>

      {filteredExpenses.length === 0 ? (
        <View style={styles.card}>
          <FishermanIcon name="alert" size={32} color={ui.muted} />
          <Text style={styles.emptyTitle}>No Expenses in this Category</Text>
          <Text style={styles.emptySub}>
            Record diesel fuel, crushed ice blocks, crew provisions or harbor gate levies.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleAddExpense}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>+ Log First Expense (S18)</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.expensesListWrap}>
          {filteredExpenses.map((e, index) => {
            const theme = getCategoryTheme(e.category);
            return (
              <View key={e.id || index} style={styles.expenseItemCard}>
                {/* TOP ROW: TITLE & AMOUNT */}
                <View style={styles.expenseTopRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={styles.expenseItemTitle}>
                      {e.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.receiptNoteText}>
                      🧾 {e.receiptNote ?? 'Harbor station slip'}
                    </Text>
                  </View>

                  <Text style={styles.expenseItemAmount}>- {money(e.amount)}</Text>
                </View>

                <View style={styles.itemDivider} />

                {/* BOTTOM ROW: CATEGORY, DATE & EDIT CONTROLS */}
                <View style={styles.expenseBottomRow}>
                  <View style={[styles.catBadge, { backgroundColor: theme.bg }]}>
                    <Text style={[styles.catBadgeText, { color: theme.text }]}>
                      {theme.label}
                    </Text>
                  </View>

                  <Text style={styles.recordedTimeText}>🕒 {e.recordedAt}</Text>

                  {/* 02. EDIT EXPENSE -> S18 & DELETE */}
                  <View style={styles.rowActionsWrap}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${e.title}`}
                      onPress={() => handleEditExpense(e)}
                      style={styles.editActionBtn}
                    >
                      <FishermanIcon name="sparkles" size={12} color={ui.tealDark} />
                      <Text style={styles.editActionText}>Edit (S18)</Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${e.title}`}
                      onPress={() => handleDeleteExpense(e)}
                      style={styles.deleteActionBtn}
                    >
                      <FishermanIcon name="minus" size={12} color="#DC2626" />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 02. FOOTER ACTIONS */}
      <View style={styles.footerActionsCol}>
        <Pressable
          accessibilityRole="button"
          onPress={handleAddExpense}
          style={styles.footerPrimaryBtn}
        >
          <FishermanIcon name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.footerPrimaryBtnText}>+ Add New Expense (S18)</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
          style={styles.footerBackBtn}
        >
          <FishermanIcon name="arrow-left" size={15} color={ui.navy} />
          <Text style={styles.footerBackBtnText}>Back to Trip Details (S13)</Text>
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

  // TRIP INFO CARD
  tripInfoCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 12,
  },
  tripInfoTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  tripNumberHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: ui.navy,
  },
  boatDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: ui.muted,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillCompleted: {
    backgroundColor: '#ECFDF5',
  },
  statusPillOngoing: {
    backgroundColor: '#E0F2FE',
  },
  statusPillPlanned: {
    backgroundColor: '#FFFBEB',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '900',
  },
  statusTextCompleted: {
    color: '#059669',
  },
  statusTextOngoing: {
    color: '#0284C7',
  },
  statusTextPlanned: {
    color: '#D97706',
  },
  cardDivider: {
    height: 1,
    backgroundColor: ui.border,
    marginVertical: 10,
  },
  tripInfoBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tripDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
  },
  tripLinkPill: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  tripLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },

  // TOTAL EXPENSES CARD
  totalExpensesCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 12,
  },
  totalExpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  totalExpLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 0.8,
  },
  totalExpAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#DC2626',
    marginTop: 2,
  },
  totalExpSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 2,
  },
  addExpenseHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealDark,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addExpenseHeaderBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // CATEGORY FILTER
  categoryFilterScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  categoryFilterChip: {
    backgroundColor: ui.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ui.border,
  },
  categoryFilterChipActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  categoryFilterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
  },
  categoryFilterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // EXPENSE LIST
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  sectionSub: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.muted,
  },
  expensesListWrap: {
    gap: 10,
    marginBottom: 16,
  },
  expenseItemCard: {
    backgroundColor: ui.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
  },
  expenseTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  expenseItemTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  receiptNoteText: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '600',
    marginTop: 3,
  },
  expenseItemAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#DC2626',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  expenseBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  catBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  recordedTimeText: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
  },
  rowActionsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editActionText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  deleteActionBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // EMPTY CARD
  card: {
    backgroundColor: ui.surface,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 8,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 11,
    color: ui.muted,
    textAlign: 'center',
    marginBottom: 14,
  },
  addBtn: {
    backgroundColor: ui.tealDark,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // FOOTER ACTIONS
  footerActionsCol: {
    gap: 10,
    marginBottom: 30,
  },
  footerPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ui.tealDark,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  footerPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  footerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ui.surface,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ui.border,
  },
  footerBackBtnText: {
    color: ui.navy,
    fontWeight: '800',
    fontSize: 13,
  },
});
