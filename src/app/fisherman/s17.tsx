import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

export default function S17ExpensesScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { trips } = useFisherman();

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
          <Text style={styles.emptyTitle}>Trip record not found</Text>
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

  const expensesList = trip.expensesList ?? [];
  const totalExpenses = expensesList.length > 0
    ? expensesList.reduce((sum, e) => sum + e.amount, 0)
    : (trip.fuelCost || 0) + (trip.iceBaitCost || 0) + (trip.otherCost || 0);

  const fuelCost = expensesList.filter((e) => e.category === 'fuel').reduce((sum, e) => sum + e.amount, 0) || trip.fuelCost;
  const iceCost = expensesList.filter((e) => e.category === 'ice').reduce((sum, e) => sum + e.amount, 0) || Math.round(trip.iceBaitCost * 0.65);
  const baitCost = expensesList.filter((e) => e.category === 'bait').reduce((sum, e) => sum + e.amount, 0) || Math.round(trip.iceBaitCost * 0.35);
  const harborCost = expensesList.filter((e) => e.category === 'harbor').reduce((sum, e) => sum + e.amount, 0) || trip.otherCost;

  const handleExportExpenseSheet = () => {
    Alert.alert(
      'Export Expense Statement (S17)',
      `Generating voyage expense ledger for ${trip.tripNumber}.\n\nTotal Operational Deductions: ${money(totalExpenses)}\nFuel: ${money(fuelCost)}\nIce & Bait: ${money(iceCost + baitCost)}\n\nExported to documents.`,
      [{ text: 'OK' }],
    );
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'fuel':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'ice':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'bait':
        return { bg: '#FCE7F3', text: '#9D174D' };
      case 'harbor':
        return { bg: '#EDE9FE', text: '#5B21B6' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  return (
    <FishermanShell
      title={`S17 · ${trip.tripNumber} Expenses`}
      subtitle="Operational expenditure & fuel vouchers"
      back
      onBack={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
      rightIcon="sparkles"
      rightLabel="Ledger"
      onRightPress={handleExportExpenseSheet}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S17</Text>
        </View>
        <Text numberOfLines={1} style={styles.helperText}>
          Itemized fuel, ice, bait & port levies for voyage {trip.tripNumber}
        </Text>
      </View>

      {/* TOTAL EXPENSE CARD */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>TOTAL OPERATIONAL VOYAGE COSTS</Text>
        <Text style={styles.summaryAmount}>- {money(totalExpenses)}</Text>
        <Text style={styles.summarySub}>
          Vessel: {trip.boatName} · {expensesList.length} expenses logged
        </Text>
      </View>

      {/* 4-WAY CATEGORY MINI CARDS */}
      <View style={styles.categoryGrid}>
        <View style={styles.catCell}>
          <Text style={styles.catCellLabel}>⛽ FUEL DIESEL</Text>
          <Text style={styles.catCellValue}>{money(fuelCost)}</Text>
        </View>
        <View style={styles.catCell}>
          <Text style={styles.catCellLabel}>🧊 CRUSHED ICE</Text>
          <Text style={styles.catCellValue}>{money(iceCost)}</Text>
        </View>
        <View style={styles.catCell}>
          <Text style={styles.catCellLabel}>🐟 FRESH BAIT</Text>
          <Text style={styles.catCellValue}>{money(baitCost)}</Text>
        </View>
        <View style={styles.catCell}>
          <Text style={styles.catCellLabel}>⚓ HARBOR LEVY</Text>
          <Text style={styles.catCellValue}>{money(harborCost)}</Text>
        </View>
      </View>

      {/* ACTION BAR */}
      <View style={styles.actionBar}>
        <Text style={styles.sectionTitle}>Expense Vouchers ({expensesList.length})</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/fisherman/s18' as never, params: { tripId: trip.id } })}
          style={styles.addExpenseBtn}
        >
          <FishermanIcon name="plus" size={13} color="#FFFFFF" />
          <Text style={styles.addExpenseBtnText}>+ Add Expense (S18)</Text>
        </Pressable>
      </View>

      {/* EXPENSES LIST */}
      {expensesList.length === 0 ? (
        <View style={styles.card}>
          <FishermanIcon name="alert" size={32} color={ui.muted} />
          <Text style={styles.emptyTitle}>No Expenses Recorded</Text>
          <Text style={styles.emptySub}>
            Track diesel fuel receipts, ice crates, and harbor berthing slips.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/fisherman/s18' as never, params: { tripId: trip.id } })}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>+ Log First Expense (S18)</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.expenseList}>
          {expensesList.map((e, index) => {
            const catColor = getCategoryBadgeColor(e.category);
            return (
              <View key={e.id || index} style={styles.expenseCard}>
                <View style={styles.expenseHeaderRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={styles.expenseTitle}>
                      {e.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.receiptNote}>
                      🧾 {e.receiptNote ?? 'Harbor station slip'}
                    </Text>
                  </View>
                  <Text style={styles.expenseAmount}>- {money(e.amount)}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.expenseFooterRow}>
                  <View style={[styles.catBadge, { backgroundColor: catColor.bg }]}>
                    <Text style={[styles.catBadgeText, { color: catColor.text }]}>
                      {e.category.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.timeText}>🕒 {e.recordedAt}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* FOOTER */}
      <View style={styles.footerRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
          style={styles.backBtn}
        >
          <FishermanIcon name="arrow-left" size={15} color={ui.navy} />
          <Text style={styles.backBtnText}>Back to Trip Details (S13)</Text>
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
  summaryCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 14,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 0.8,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#DC2626',
    marginTop: 2,
  },
  summarySub: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.muted,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  catCell: {
    width: '48.5%',
    backgroundColor: ui.surface,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ui.border,
  },
  catCellLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.6,
  },
  catCellValue: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  actionBar: {
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
  addExpenseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealDark,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addExpenseBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  expenseList: {
    gap: 10,
    marginBottom: 16,
  },
  expenseCard: {
    backgroundColor: ui.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
  },
  expenseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  expenseTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  receiptNote: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '600',
    marginTop: 3,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#DC2626',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  expenseFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  timeText: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
  },
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
  footerRow: {
    marginBottom: 30,
  },
  backBtn: {
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
  backBtnText: {
    color: ui.navy,
    fontWeight: '800',
    fontSize: 13,
  },
});
