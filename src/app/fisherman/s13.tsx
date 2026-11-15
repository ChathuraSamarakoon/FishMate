import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { TripCatchRecord, TripExpenseRecord, TripSaleRecord } from '@/types';

type ActiveTab = 'catches' | 'expenses' | 'sales';

export default function S13TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { trips, profile } = useFisherman();
  const [activeTab, setActiveTab] = useState<ActiveTab>('catches');

  // Find target trip or fall back to the latest trip
  const trip = trips.find((t) => t.id === id) || trips[0];

  if (!trip) {
    return (
      <FishermanShell
        back
        title="S13 · Trip Not Found"
        subtitle="Voyage record unavailable"
        onBack={() => router.replace('/fisherman/trips')}
      >
        <View style={styles.notFoundCard}>
          <Text style={styles.notFoundTitle}>Voyage Record Not Found</Text>
          <Text style={styles.notFoundSub}>This fishing voyage log could not be found.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/fisherman/trips')}
            style={styles.notFoundBtn}
          >
            <Text style={styles.notFoundBtnText}>Back to Trips (S11)</Text>
          </Pressable>
        </View>
      </FishermanShell>
    );
  }

  const isCompleted = trip.status === 'completed';
  const isOngoing = trip.status === 'ongoing';

  // Catches, Expenses, Sales lists
  const catches: TripCatchRecord[] = trip.catches ?? [];
  const expensesList: TripExpenseRecord[] = trip.expensesList ?? [];
  const salesList: TripSaleRecord[] = trip.salesList ?? [];

  // Behavior & Validation:
  // 1. Trip-level revenue = recorded sale totals
  // 2. Profit = revenue - recorded expenses
  const recordedRevenue = salesList.reduce((sum, s) => sum + s.totalAmount, 0);
  const recordedExpenses = expensesList.reduce((sum, e) => sum + e.amount, 0);

  const tripRevenue = salesList.length > 0 ? recordedRevenue : (trip.revenue ?? 0);
  const tripExpenses = expensesList.length > 0
    ? recordedExpenses
    : (trip.fuelCost || 0) + (trip.iceBaitCost || 0) + (trip.otherCost || 0);

  const tripProfit = tripRevenue - tripExpenses;
  const profitMargin = tripRevenue > 0 ? Math.round((tripProfit / tripRevenue) * 100) : 0;

  // Catches summary
  const totalCatchWeightKg = catches.reduce((sum, c) => sum + c.weightKg, 0) || trip.catchVolumeKg || 0;
  const totalCatchEstimatedValue = catches.reduce((sum, c) => sum + (c.estimatedValue || 0), 0);

  // Expenses summary breakdown
  const fuelExpense = expensesList.filter((e) => e.category === 'fuel').reduce((sum, e) => sum + e.amount, 0) || trip.fuelCost;
  const iceBaitExpense = expensesList.filter((e) => e.category === 'ice' || e.category === 'bait').reduce((sum, e) => sum + e.amount, 0) || trip.iceBaitCost;
  const harborOtherExpense = expensesList.filter((e) => e.category !== 'fuel' && e.category !== 'ice' && e.category !== 'bait').reduce((sum, e) => sum + e.amount, 0) || trip.otherCost;

  // Sales summary breakdown
  const paidSales = salesList.filter((s) => s.paymentStatus !== 'pending');
  const paidAmount = paidSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const pendingSales = salesList.filter((s) => s.paymentStatus === 'pending');
  const pendingAmount = pendingSales.reduce((sum, s) => sum + s.totalAmount, 0);

  // Navigation handlers
  const handleEditTrip = () => {
    router.push({ pathname: '/fisherman/s14' as never, params: { id: trip.id } });
  };

  const handleCatchRecords = () => {
    router.push({ pathname: '/fisherman/s15' as never, params: { tripId: trip.id } });
  };

  const handleAddCatch = () => {
    router.push({ pathname: '/fisherman/s16' as never, params: { tripId: trip.id } });
  };

  const handleExpenses = () => {
    router.push({ pathname: '/fisherman/s17' as never, params: { tripId: trip.id } });
  };

  const handleAddExpense = () => {
    router.push({ pathname: '/fisherman/s18' as never, params: { tripId: trip.id } });
  };

  const handleSales = () => {
    router.push({ pathname: '/fisherman/s19' as never, params: { tripId: trip.id } });
  };

  const handleAddSale = () => {
    router.push({ pathname: '/fisherman/s20' as never, params: { tripId: trip.id } });
  };

  const handleFinancialSummary = () => {
    router.push({ pathname: '/fisherman/s21' as never, params: { tripId: trip.id } });
  };

  const handleExportPDF = () => {
    Alert.alert(
      'Export Voyage Statement (S13)',
      `Generating comprehensive sea voyage report for ${trip.tripNumber} (${trip.boatName || profile.boatName}).\n\nRevenue: ${money(tripRevenue)}\nExpenses: ${money(tripExpenses)}\nNet Profit: ${money(tripProfit)} (${profitMargin}% margin)\n\nPDF exported to documents.`,
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
      title={`S13 · ${trip.tripNumber}`}
      subtitle="Trip details, financial statements & records"
      back
      onBack={() => router.replace('/fisherman/trips')}
      rightIcon="sparkles"
      rightLabel="Export"
      onRightPress={handleExportPDF}
    >
      {/* SCREEN BREADCRUMB */}
      <View style={styles.breadcrumbRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S13</Text>
        </View>
        <Text numberOfLines={1} style={styles.breadcrumbText}>
          Trip Date, Location, Boat, Profit & Records
        </Text>
      </View>

      {/* HEADER CARD: TRIP DATE, LOCATION, BOAT, DEPARTURE/RETURN & EDIT */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.tripBadgeRow}>
              <Text style={styles.tripNumberHeading}>{trip.tripNumber}</Text>
              {trip.isOvernight ? (
                <View style={styles.overnightBadge}>
                  <Text style={styles.overnightText}>🌙 Overnight</Text>
                </View>
              ) : null}
            </View>
            <Text numberOfLines={1} style={styles.vesselSubTitle}>
              ⛵ {trip.boatName || profile.boatName} · {profile.registrationNumber ?? 'CFV-A-4198-NEG'}
            </Text>
          </View>

          {/* EDIT TRIP BUTTON (S14) & STATUS */}
          <View style={styles.headerActionCol}>
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

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit Trip S14"
              onPress={handleEditTrip}
              style={styles.editTripBtn}
            >
              <FishermanIcon name="sparkles" size={12} color={ui.tealDark} />
              <Text style={styles.editTripBtnText}>Edit Trip (S14)</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* TRIP DATE & LOCATION */}
        <View style={styles.metaGrid}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>FISHING LOCATION</Text>
            <View style={styles.metaValueRow}>
              <FishermanIcon name="pin" size={13} color={ui.tealDark} />
              <Text numberOfLines={1} style={styles.metaLocationText}>
                {trip.harbor}
              </Text>
            </View>
          </View>

          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>TRIP VOYAGE DATE</Text>
            <Text numberOfLines={1} style={styles.metaValueText}>
              📅 {trip.tripDate || trip.departureDate.split(',')[0] || 'Today'}
            </Text>
          </View>
        </View>

        {/* DEPARTURE & RETURN */}
        <View style={styles.metaTimeRow}>
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>🚩 DEPARTURE</Text>
            <Text style={styles.timeValue}>{trip.departureDate}</Text>
          </View>
          <View style={styles.timeArrow}>
            <FishermanIcon name="chevron-right" size={14} color={ui.muted} />
          </View>
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>⚓ RETURN / LANDING</Text>
            <Text style={styles.timeValue}>{trip.returnDate}</Text>
          </View>
        </View>
      </View>

      {/* TOP FINANCIAL CARDS (REVENUE, EXPENSES, BASIC PROFIT) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Trip Financial Performance</Text>
        <Pressable
          accessibilityRole="button"
          onPress={handleFinancialSummary}
          style={styles.financialLinkBtn}
        >
          <Text style={styles.financialLinkText}>Financial Summary (S21) →</Text>
        </Pressable>
      </View>

      {/* 3 FINANCIAL CARDS ROW */}
      <View style={styles.kpiRow}>
        {/* REVENUE CARD */}
        <View style={[styles.kpiCard, styles.revenueCard]}>
          <View style={styles.kpiTopRow}>
            <Text style={styles.kpiLabel}>REVENUE</Text>
            <View style={styles.revenueIconWrap}>
              <FishermanIcon name="revenue" size={13} color="#059669" />
            </View>
          </View>
          <Text style={styles.revenueValue}>{money(tripRevenue)}</Text>
          <Text numberOfLines={1} style={styles.kpiSubText}>
            {salesList.length > 0 ? `${salesList.length} sales recorded` : 'Estimated harvest sales'}
          </Text>
        </View>

        {/* EXPENSES CARD */}
        <View style={[styles.kpiCard, styles.expenseCard]}>
          <View style={styles.kpiTopRow}>
            <Text style={styles.kpiLabel}>EXPENSES</Text>
            <View style={styles.expenseIconWrap}>
              <FishermanIcon name="alert" size={13} color="#DC2626" />
            </View>
          </View>
          <Text style={styles.expenseValue}>- {money(tripExpenses)}</Text>
          <Text numberOfLines={1} style={styles.kpiSubText}>
            {expensesList.length > 0 ? `${expensesList.length} items logged` : 'Fuel & logistics'}
          </Text>
        </View>
      </View>

      {/* BASIC PROFIT CARD */}
      <View style={styles.profitCard}>
        <View style={styles.profitHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.profitCardLabel}>BASIC NET PROFIT (REVENUE − EXPENSES)</Text>
            <Text style={styles.profitCardAmount}>
              {tripProfit >= 0 ? `+ ${money(tripProfit)}` : `- ${money(Math.abs(tripProfit))}`}
            </Text>
          </View>
          <View style={styles.marginBadge}>
            <Text style={styles.marginBadgeText}>{profitMargin}% Margin</Text>
          </View>
        </View>

        <View style={styles.profitFormulaStrip}>
          <Text numberOfLines={1} style={styles.profitFormulaText}>
            📐 Net Profit = Revenue ({money(tripRevenue)}) − Expenses ({money(tripExpenses)})
          </Text>
        </View>
      </View>

      {/* 3-WAY SEGMENTED TABS: CATCHES / EXPENSES / SALES */}
      <View style={styles.tabContainer}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'catches' }}
          onPress={() => setActiveTab('catches')}
          style={[styles.tabButton, activeTab === 'catches' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabButtonText, activeTab === 'catches' && styles.tabButtonTextActive]}>
            🐟 Catches ({catches.length})
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'expenses' }}
          onPress={() => setActiveTab('expenses')}
          style={[styles.tabButton, activeTab === 'expenses' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabButtonText, activeTab === 'expenses' && styles.tabButtonTextActive]}>
            💳 Expenses ({expensesList.length})
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'sales' }}
          onPress={() => setActiveTab('sales')}
          style={[styles.tabButton, activeTab === 'sales' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabButtonText, activeTab === 'sales' && styles.tabButtonTextActive]}>
            💰 Sales ({salesList.length})
          </Text>
        </Pressable>
      </View>

      {/* ==================== TAB CONTENT ==================== */}

      {/* TAB 1: CATCHES */}
      {activeTab === 'catches' && (
        <View style={styles.tabContentWrap}>
          {/* TAB HEADER & ACTIONS */}
          <View style={styles.tabActionBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tabSummaryTitle}>Harvested Catch Yield</Text>
              <Text style={styles.tabSummarySubtitle}>
                Total {totalCatchWeightKg.toFixed(1)} kg landed · Est. {money(totalCatchEstimatedValue)}
              </Text>
            </View>
            <View style={styles.tabActionsRow}>
              <Pressable
                accessibilityRole="button"
                onPress={handleCatchRecords}
                style={styles.tabSecondaryAction}
              >
                <Text style={styles.tabSecondaryActionText}>Records (S15)</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleAddCatch}
                style={styles.tabPrimaryAction}
              >
                <FishermanIcon name="plus" size={13} color="#FFFFFF" />
                <Text style={styles.tabPrimaryActionText}>Add Catch (S16)</Text>
              </Pressable>
            </View>
          </View>

          {/* CATCH RECORDS LIST */}
          {catches.length === 0 ? (
            <View style={styles.emptyTabCard}>
              <FishermanIcon name="boat" size={28} color={ui.muted} />
              <Text style={styles.emptyTabTitle}>No Catch Records Yet</Text>
              <Text style={styles.emptyTabSub}>
                Log species, weight, quality grade and cold storage method.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={handleAddCatch}
                style={styles.emptyAddBtn}
              >
                <Text style={styles.emptyAddBtnText}>+ Log First Catch (S16)</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.recordsList}>
              {catches.map((c) => (
                <View key={c.id} style={styles.catchRecordCard}>
                  <View style={styles.recordTopRow}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={styles.recordMainTitle}>
                        {c.species}
                      </Text>
                      <Text numberOfLines={1} style={styles.recordSubText}>
                        {c.grade ?? 'Standard Grade'} · {c.storageMethod ?? 'Chilled ice bin'}
                      </Text>
                    </View>
                    <View style={styles.weightBadge}>
                      <Text style={styles.weightBadgeText}>{c.weightKg.toFixed(1)} kg</Text>
                    </View>
                  </View>

                  <View style={styles.recordBottomRow}>
                    <Text style={styles.timestampText}>🕒 {c.recordedAt}</Text>
                    {c.estimatedValue ? (
                      <Text style={styles.estimatedValueText}>
                        Est: {money(c.estimatedValue)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* TAB 2: EXPENSES */}
      {activeTab === 'expenses' && (
        <View style={styles.tabContentWrap}>
          {/* TAB HEADER & ACTIONS */}
          <View style={styles.tabActionBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tabSummaryTitle}>Operational Voyage Costs</Text>
              <Text style={styles.tabSummarySubtitle}>
                Total {money(tripExpenses)} · Fuel: {money(fuelExpense)}
              </Text>
            </View>
            <View style={styles.tabActionsRow}>
              <Pressable
                accessibilityRole="button"
                onPress={handleExpenses}
                style={styles.tabSecondaryAction}
              >
                <Text style={styles.tabSecondaryActionText}>Expenses (S17)</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleAddExpense}
                style={styles.tabPrimaryAction}
              >
                <FishermanIcon name="plus" size={13} color="#FFFFFF" />
                <Text style={styles.tabPrimaryActionText}>Add Expense (S18)</Text>
              </Pressable>
            </View>
          </View>

          {/* EXPENSE SUMMARY PILLS */}
          <View style={styles.expensePillsRow}>
            <View style={styles.expensePillItem}>
              <Text style={styles.expensePillLabel}>⛽ Fuel</Text>
              <Text style={styles.expensePillValue}>{money(fuelExpense)}</Text>
            </View>
            <View style={styles.expensePillItem}>
              <Text style={styles.expensePillLabel}>🧊 Ice & Bait</Text>
              <Text style={styles.expensePillValue}>{money(iceBaitExpense)}</Text>
            </View>
            <View style={styles.expensePillItem}>
              <Text style={styles.expensePillLabel}>⚓ Harbor/Other</Text>
              <Text style={styles.expensePillValue}>{money(harborOtherExpense)}</Text>
            </View>
          </View>

          {/* EXPENSES LIST */}
          {expensesList.length === 0 ? (
            <View style={styles.emptyTabCard}>
              <FishermanIcon name="alert" size={28} color={ui.muted} />
              <Text style={styles.emptyTabTitle}>No Expenses Recorded</Text>
              <Text style={styles.emptyTabSub}>
                Track fuel diesel, ice crates, bait squid, harbor berthing slip fees.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={handleAddExpense}
                style={styles.emptyAddBtn}
              >
                <Text style={styles.emptyAddBtnText}>+ Log Expense (S18)</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.recordsList}>
              {expensesList.map((e) => {
                const catColor = getCategoryBadgeColor(e.category);
                return (
                  <View key={e.id} style={styles.expenseRecordCard}>
                    <View style={styles.recordTopRow}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text numberOfLines={1} style={styles.recordMainTitle}>
                          {e.title}
                        </Text>
                        <Text numberOfLines={1} style={styles.recordSubText}>
                          {e.receiptNote ?? 'Harbor station slip'}
                        </Text>
                      </View>
                      <Text style={styles.expenseAmountText}>- {money(e.amount)}</Text>
                    </View>

                    <View style={styles.recordBottomRow}>
                      <View style={[styles.catBadge, { backgroundColor: catColor.bg }]}>
                        <Text style={[styles.catBadgeText, { color: catColor.text }]}>
                          {e.category.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.timestampText}>🕒 {e.recordedAt}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* TAB 3: SALES */}
      {activeTab === 'sales' && (
        <View style={styles.tabContentWrap}>
          {/* TAB HEADER & ACTIONS */}
          <View style={styles.tabActionBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tabSummaryTitle}>Catch Sales & Dispatches</Text>
              <Text style={styles.tabSummarySubtitle}>
                Total {money(tripRevenue)} · Paid: {money(paidAmount)}
              </Text>
            </View>
            <View style={styles.tabActionsRow}>
              <Pressable
                accessibilityRole="button"
                onPress={handleSales}
                style={styles.tabSecondaryAction}
              >
                <Text style={styles.tabSecondaryActionText}>Sales (S19)</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleAddSale}
                style={styles.tabPrimaryAction}
              >
                <FishermanIcon name="plus" size={13} color="#FFFFFF" />
                <Text style={styles.tabPrimaryActionText}>Add Sale (S20)</Text>
              </Pressable>
            </View>
          </View>

          {/* SALES BREAKDOWN BANNER */}
          <View style={styles.salesStatStrip}>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>PAID IN FULL</Text>
              <Text style={styles.statPaidVal}>
                {money(paidAmount)} ({paidSales.length})
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>PENDING PAYMENT</Text>
              <Text style={styles.statPendingVal}>
                {money(pendingAmount)} ({pendingSales.length})
              </Text>
            </View>
          </View>

          {/* SALES LIST */}
          {salesList.length === 0 ? (
            <View style={styles.emptyTabCard}>
              <FishermanIcon name="revenue" size={28} color={ui.muted} />
              <Text style={styles.emptyTabTitle}>No Sales Logged Yet</Text>
              <Text style={styles.emptyTabSub}>
                Record wholesale auction deals, restaurant deliveries, or harbor walk-ins.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={handleAddSale}
                style={styles.emptyAddBtn}
              >
                <Text style={styles.emptyAddBtnText}>+ Record Sale (S20)</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.recordsList}>
              {salesList.map((s) => {
                const isPaid = s.paymentStatus !== 'pending';
                return (
                  <View key={s.id} style={styles.saleRecordCard}>
                    <View style={styles.recordTopRow}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text numberOfLines={1} style={styles.recordMainTitle}>
                          {s.buyerName}
                        </Text>
                        <Text numberOfLines={1} style={styles.recordSubText}>
                          {s.speciesSold} · {s.quantityKg.toFixed(1)} kg @ Rs. {s.pricePerKg.toLocaleString()}/kg
                        </Text>
                      </View>
                      <Text style={styles.saleAmountText}>+ {money(s.totalAmount)}</Text>
                    </View>

                    <View style={styles.recordBottomRow}>
                      <View
                        style={[
                          styles.paymentBadge,
                          isPaid ? styles.paidBadge : styles.pendingBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.paymentBadgeText,
                            isPaid ? styles.paidBadgeText : styles.pendingBadgeText,
                          ]}
                        >
                          {s.paymentStatus === 'paid_bank'
                            ? 'Paid (Bank)'
                            : s.paymentStatus === 'paid_cash'
                            ? 'Paid (Cash)'
                            : 'Payment Pending'}
                        </Text>
                      </View>
                      <Text style={styles.timestampText}>🕒 {s.recordedAt}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* QUICK ACTIONS & FINANCIAL SUMMARY FOOTER */}
      <View style={styles.footerSection}>
        <Pressable
          accessibilityRole="button"
          onPress={handleFinancialSummary}
          style={styles.financialSummaryCard}
        >
          <View style={styles.finSummaryIconWrap}>
            <FishermanIcon name="sparkles" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.finSummaryHeading}>View Financial Summary (S21)</Text>
            <Text style={styles.finSummarySub}>
              Detailed voyage analytics, cost-per-kg yield & season profits
            </Text>
          </View>
          <FishermanIcon name="chevron-right" size={16} color={ui.tealDark} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/fisherman/trips')}
          style={styles.backTripsBtn}
        >
          <FishermanIcon name="arrow-left" size={15} color={ui.navy} />
          <Text style={styles.backTripsBtnText}>Back to Fishing Trips (S11)</Text>
        </Pressable>
      </View>
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  breadcrumbRow: {
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
  breadcrumbText: {
    fontSize: 11,
    color: ui.muted,
    flex: 1,
  },
  notFoundCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
    marginTop: 20,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 6,
  },
  notFoundSub: {
    fontSize: 13,
    color: ui.muted,
    textAlign: 'center',
    marginBottom: 18,
  },
  notFoundBtn: {
    backgroundColor: ui.tealDark,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  notFoundBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  // HEADER CARD
  headerCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 14,
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  tripBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripNumberHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: -0.4,
  },
  overnightBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  overnightText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7E22CE',
  },
  vesselSubTitle: {
    fontSize: 12,
    color: ui.muted,
    fontWeight: '700',
    marginTop: 3,
  },
  headerActionCol: {
    alignItems: 'flex-end',
    gap: 6,
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
    fontSize: 11,
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
  editTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  editTripBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  cardDivider: {
    height: 1,
    backgroundColor: ui.border,
    marginVertical: 12,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  metaCell: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  metaLocationText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
    flex: 1,
  },
  metaValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaValueText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
  },
  metaTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    padding: 10,
    gap: 8,
  },
  timeBox: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.6,
  },
  timeValue: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 2,
  },
  timeArrow: {
    paddingHorizontal: 2,
  },

  // FINANCIAL SECTION
  sectionHeaderRow: {
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
  financialLinkBtn: {
    paddingVertical: 2,
  },
  financialLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    backgroundColor: ui.surface,
  },
  revenueCard: {
    borderColor: '#D1FAE5',
    backgroundColor: '#F0FDF4',
  },
  expenseCard: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.8,
  },
  revenueIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
    marginTop: 6,
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#DC2626',
    marginTop: 6,
  },
  kpiSubText: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.muted,
    marginTop: 3,
  },

  // PROFIT CARD
  profitCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 14,
  },
  profitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profitCardLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  profitCardAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  marginBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  marginBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profitFormulaStrip: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  profitFormulaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },

  // 3-WAY SEGMENTED TABS
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8F1F4',
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: ui.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.muted,
  },
  tabButtonTextActive: {
    color: ui.navy,
    fontWeight: '900',
  },

  // TAB CONTENT & ACTIONS
  tabContentWrap: {
    marginBottom: 14,
  },
  tabActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  tabSummaryTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  tabSummarySubtitle: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '600',
    marginTop: 1,
  },
  tabActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabSecondaryAction: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tabSecondaryActionText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  tabPrimaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealDark,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tabPrimaryActionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // EXPENSE PILLS
  expensePillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  expensePillItem: {
    flex: 1,
    backgroundColor: '#F8FCFD',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: ui.border,
  },
  expensePillLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.muted,
  },
  expensePillValue: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },

  // SALES STRIP
  salesStatStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 12,
  },
  statCell: {
    flex: 1,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.6,
  },
  statPaidVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  statPendingVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D97706',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: ui.border,
    marginHorizontal: 10,
  },

  // RECORDS LIST
  recordsList: {
    gap: 10,
  },
  catchRecordCard: {
    backgroundColor: ui.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
  },
  expenseRecordCard: {
    backgroundColor: ui.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
  },
  saleRecordCard: {
    backgroundColor: ui.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
  },
  recordTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  recordMainTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  recordSubText: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  weightBadge: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weightBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.tealDark,
  },
  expenseAmountText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#DC2626',
  },
  saleAmountText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#059669',
  },
  recordBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timestampText: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
  },
  estimatedValueText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  paymentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paidBadge: {
    backgroundColor: '#ECFDF5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  paymentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  paidBadgeText: {
    color: '#059669',
  },
  pendingBadgeText: {
    color: '#B45309',
  },

  // EMPTY TAB
  emptyTabCard: {
    backgroundColor: ui.surface,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  emptyTabTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 8,
    marginBottom: 4,
  },
  emptyTabSub: {
    fontSize: 11,
    color: ui.muted,
    textAlign: 'center',
    marginBottom: 14,
  },
  emptyAddBtn: {
    backgroundColor: ui.tealDark,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // FOOTER & FINANCIAL SUMMARY
  footerSection: {
    gap: 10,
    marginTop: 4,
    marginBottom: 30,
  },
  financialSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FA',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CDE5EB',
    gap: 12,
  },
  finSummaryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: ui.tealDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finSummaryHeading: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  finSummarySub: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  backTripsBtn: {
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
  backTripsBtnText: {
    color: ui.navy,
    fontWeight: '800',
    fontSize: 13,
  },
});
