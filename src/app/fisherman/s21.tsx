import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { EmptyStateCard, SectionHeader, money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { FishingTrip } from '@/types';

type DateFilterType = 'all' | 'this_week' | 'this_month' | 'completed';

const DATE_FILTERS: { key: DateFilterType; label: string }[] = [
  { key: 'all', label: 'All Voyages' },
  { key: 'this_week', label: 'This Week' },
  { key: 'this_month', label: 'This Month' },
  { key: 'completed', label: 'Completed Only' },
];

/**
 * 03. BEHAVIOR & VALIDATION:
 * Basic Profit = Revenue - Recorded Expenses
 * Strictly operational voyage calculation (Gross Sales - Recorded Fuel/Ice/Bait/Port/Boat costs).
 * Advanced corporate accounting/net profit is NOT used.
 */
function computeTripFinances(trip: FishingTrip) {
  // 1. Trip-level Revenue: recorded sales if available, else trip.revenue or catch estimate
  const recordedRevenue =
    trip.salesList && trip.salesList.length > 0
      ? trip.salesList.reduce((sum, s) => sum + s.totalAmount, 0)
      : (trip.revenue ?? Math.round(trip.catchVolumeKg * 1250));

  // 2. Trip-level Expenses: itemized recorded expenses if available, else sum of cost fields
  const recordedExpenses =
    trip.expensesList && trip.expensesList.length > 0
      ? trip.expensesList.reduce((sum, e) => sum + e.amount, 0)
      : (trip.fuelCost || 0) + (trip.iceBaitCost || 0) + (trip.otherCost || 0);

  // 3. Basic Profit = Revenue - Recorded Expenses
  const basicProfit = recordedRevenue - recordedExpenses;
  const marginPercent =
    recordedRevenue > 0 ? Math.round((basicProfit / recordedRevenue) * 100) : 0;

  // Breakdown of categories for analytical depth
  const fuelExpense =
    trip.expensesList && trip.expensesList.length > 0
      ? trip.expensesList
          .filter((e) => e.category === 'fuel')
          .reduce((sum, e) => sum + e.amount, 0)
      : trip.fuelCost || 0;

  const iceBaitExpense =
    trip.expensesList && trip.expensesList.length > 0
      ? trip.expensesList
          .filter((e) => e.category === 'ice' || e.category === 'bait')
          .reduce((sum, e) => sum + e.amount, 0)
      : trip.iceBaitCost || 0;

  const harborOtherExpense =
    trip.expensesList && trip.expensesList.length > 0
      ? trip.expensesList
          .filter((e) => e.category !== 'fuel' && e.category !== 'ice' && e.category !== 'bait')
          .reduce((sum, e) => sum + e.amount, 0)
      : trip.otherCost || 0;

  const catchKg =
    trip.catches && trip.catches.length > 0
      ? trip.catches.reduce((sum, c) => sum + c.weightKg, 0)
      : trip.catchVolumeKg || 0;

  return {
    revenue: recordedRevenue,
    expenses: recordedExpenses,
    basicProfit,
    marginPercent,
    fuelExpense,
    iceBaitExpense,
    harborOtherExpense,
    catchKg,
    salesCount: trip.salesList?.length || 0,
    expensesCount: trip.expensesList?.length || 0,
  };
}

export default function S21FinancialSummaryScreen() {
  const { trips, profile } = useFisherman();
  const params = useLocalSearchParams<{ tripId?: string; from?: string }>();

  // Filter state: Date filter & specific Trip focus
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [focusedTripId, setFocusedTripId] = useState<string>(params.tripId || 'all');

  // Filter trips based on active criteria
  const filteredTrips = useMemo(() => {
    let list = trips;

    // Apply specific trip focus if not 'all'
    if (focusedTripId !== 'all') {
      list = list.filter((t) => t.id === focusedTripId);
      return list;
    }

    // Apply date/status filter
    if (dateFilter === 'this_week') {
      list = list.filter(
        (t) =>
          t.departureDate.toLowerCase().includes('today') ||
          t.departureDate.toLowerCase().includes('yesterday') ||
          t.departureDate.toLowerCase().includes('nov'),
      );
    } else if (dateFilter === 'this_month') {
      list = list.filter(
        (t) =>
          t.departureDate.toLowerCase().includes('today') ||
          t.departureDate.toLowerCase().includes('yesterday') ||
          t.departureDate.toLowerCase().includes('nov') ||
          t.departureDate.toLowerCase().includes('tomorrow'),
      );
    } else if (dateFilter === 'completed') {
      list = list.filter((t) => t.status === 'completed');
    }

    return list;
  }, [trips, dateFilter, focusedTripId]);

  // Aggregate financial metrics across filtered voyages
  const aggregateMetrics = useMemo(() => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalFuel = 0;
    let totalIceBait = 0;
    let totalHarborOther = 0;
    let totalCatchWeight = 0;

    filteredTrips.forEach((t) => {
      const fin = computeTripFinances(t);
      totalRevenue += fin.revenue;
      totalExpenses += fin.expenses;
      totalFuel += fin.fuelExpense;
      totalIceBait += fin.iceBaitExpense;
      totalHarborOther += fin.harborOtherExpense;
      totalCatchWeight += fin.catchKg;
    });

    // 03. BEHAVIOR: Basic Profit = Total Revenue - Total Recorded Expenses
    const basicProfit = totalRevenue - totalExpenses;
    const profitMargin =
      totalRevenue > 0 ? Math.round((basicProfit / totalRevenue) * 100) : 0;
    const expenseRatio =
      totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0';

    return {
      totalRevenue,
      totalExpenses,
      basicProfit,
      profitMargin,
      expenseRatio,
      totalFuel,
      totalIceBait,
      totalHarborOther,
      totalCatchWeight,
      tripsCount: filteredTrips.length,
    };
  }, [filteredTrips]);

  // 02. BUTTONS & NAVIGATION: VIEW TRIP -> S13
  const handleViewTrip = (tripId: string) => {
    router.push({
      pathname: '/fisherman/s13' as never,
      params: { id: tripId },
    });
  };

  // 02. BUTTONS & NAVIGATION: BACK -> S01
  const handleBackToS01 = () => {
    router.replace('/fisherman/dashboard');
  };

  // Export financial statement summary
  const handleExportSummary = () => {
    Alert.alert(
      'Export Financial Statement (S21)',
      `Generating Voyage Financial Statement for ${profile.name || 'Sunil Perera'}.\n\n` +
        `• Total Revenue: ${money(aggregateMetrics.totalRevenue)}\n` +
        `• Total Recorded Expenses: ${money(aggregateMetrics.totalExpenses)}\n` +
        `• Basic Profit: ${money(aggregateMetrics.basicProfit)} (${aggregateMetrics.profitMargin}% Margin)\n` +
        `• Voyages Included: ${aggregateMetrics.tripsCount}\n\n` +
        `Statement exported to PDF in device documents.`,
      [{ text: 'OK' }],
    );
  };

  // Maximum revenue among filtered trips for relative chart bar heights
  const maxTripRevenue = useMemo(() => {
    const revs = filteredTrips.map((t) => computeTripFinances(t).revenue);
    return Math.max(...revs, 100000);
  }, [filteredTrips]);

  return (
    <FishermanShell
      title="S21 · Financial Summary"
      subtitle="Voyage revenue, expenses & basic profit report"
      back
      onBack={handleBackToS01}
      rightIcon="sparkles"
      rightLabel="Export PDF"
      onRightPress={handleExportSummary}
    >
      {/* SCREEN BADGE & CONTEXT */}
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S21</Text>
        </View>
        <Text numberOfLines={1} style={styles.helperText}>
          Trip-wise financial performance & basic margin breakdown
        </Text>
      </View>

      {/* 01. DATE / TRIP FILTER PILLS */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionLabel}>DATE FILTER</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {DATE_FILTERS.map((f) => {
            const active = dateFilter === f.key && focusedTripId === 'all';
            return (
              <Pressable
                key={f.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  setDateFilter(f.key);
                  setFocusedTripId('all');
                }}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* TRIP SELECTOR CHIPS */}
        <View style={styles.tripSelectorHeader}>
          <Text style={styles.filterSectionLabel}>VOYAGE FOCUS</Text>
          {focusedTripId !== 'all' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setFocusedTripId('all')}
              hitSlop={6}
            >
              <Text style={styles.resetFocusText}>Show All Voyages ({trips.length})</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: focusedTripId === 'all' }}
            onPress={() => setFocusedTripId('all')}
            style={[styles.tripFocusChip, focusedTripId === 'all' && styles.tripFocusChipActive]}
          >
            <FishermanIcon
              name="boat"
              size={12}
              color={focusedTripId === 'all' ? '#FFFFFF' : ui.tealDark}
            />
            <Text
              style={[
                styles.tripFocusText,
                focusedTripId === 'all' && styles.tripFocusTextActive,
              ]}
            >
              All Voyages ({trips.length})
            </Text>
          </Pressable>

          {trips.map((t) => {
            const isSelected = focusedTripId === t.id;
            return (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setFocusedTripId(t.id)}
                style={[styles.tripFocusChip, isSelected && styles.tripFocusChipActive]}
              >
                <Text
                  style={[
                    styles.tripFocusText,
                    isSelected && styles.tripFocusTextActive,
                  ]}
                >
                  {t.tripNumber}
                </Text>
                {isSelected ? (
                  <View style={styles.selectedDot} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 01. MAIN FINANCIAL SUMMARY CARDS: TOTAL REVENUE, RECORDED EXPENSES, BASIC PROFIT */}
      <View style={styles.financeHeroContainer}>
        {/* HERO: BASIC PROFIT (PROMINENT KPI) */}
        <View style={styles.basicProfitCard}>
          <View style={styles.heroTopRow}>
            <View>
              <View style={styles.profitBadgeRow}>
                <Text style={styles.profitEyebrow}>VOYAGE PERFORMANCE</Text>
                <View style={styles.basicPill}>
                  <Text style={styles.basicPillText}>BASIC PROFIT</Text>
                </View>
              </View>
              <Text style={styles.basicProfitAmount}>
                {money(aggregateMetrics.basicProfit)}
              </Text>
            </View>

            <View style={styles.marginBadgeWrap}>
              <Text style={styles.marginBadgeValue}>
                {aggregateMetrics.profitMargin}%
              </Text>
              <Text style={styles.marginBadgeLabel}>Margin</Text>
            </View>
          </View>

          {/* 03. BEHAVIOR & VALIDATION: BASIC PROFIT FORMULA CALLOUT */}
          <View style={styles.formulaBanner}>
            <Text style={styles.formulaTitle}>
              📐 Basic Profit = Total Revenue − Total Recorded Expenses
            </Text>
            <Text style={styles.formulaSub}>
              Direct operational cash calculation for sea voyages. Excludes complex corporate
              accounting, asset depreciation, or tax adjustments.
            </Text>
          </View>

          <View style={styles.heroDivider} />

          {/* DUAL KPI COLUMNS: TOTAL REVENUE & RECORDED EXPENSES */}
          <View style={styles.dualKpiRow}>
            {/* 01. TOTAL REVENUE */}
            <View style={styles.kpiColumn}>
              <View style={styles.kpiTitleRow}>
                <FishermanIcon name="revenue" size={14} color={ui.tealDark} />
                <Text style={styles.kpiLabel}>Total Revenue</Text>
              </View>
              <Text style={styles.kpiAmountGreen}>
                {money(aggregateMetrics.totalRevenue)}
              </Text>
              <View style={styles.growthBadge}>
                <Text style={styles.growthBadgeText}>▲ +18.4% growth</Text>
              </View>
            </View>

            <View style={styles.kpiColumnDivider} />

            {/* 01. TOTAL RECORDED EXPENSES */}
            <View style={styles.kpiColumn}>
              <View style={styles.kpiTitleRow}>
                <FishermanIcon name="bag" size={14} color={ui.danger} />
                <Text style={styles.kpiLabel}>Recorded Expenses</Text>
              </View>
              <Text style={styles.kpiAmountRed}>
                − {money(aggregateMetrics.totalExpenses)}
              </Text>
              <Text style={styles.expenseRatioText}>
                {aggregateMetrics.expenseRatio}% of gross revenue
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 01. SIMPLE CHART (OPTIONAL VISUALIZATION) */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeaderRow}>
          <View>
            <Text style={styles.chartTitle}>Profit & Cost Distribution</Text>
            <Text style={styles.chartSubtitle}>
              Proportional breakdown of gross voyage sales
            </Text>
          </View>
          <View style={styles.chartTagPill}>
            <Text style={styles.chartTagText}>VISUAL RATIO</Text>
          </View>
        </View>

        {/* 100% SPLIT HORIZONTAL PROGRESS BAR */}
        <View style={styles.splitBarContainer}>
          <View
            style={[
              styles.splitBarProfit,
              {
                flex: Math.max(
                  0.05,
                  aggregateMetrics.totalRevenue > 0
                    ? aggregateMetrics.basicProfit / aggregateMetrics.totalRevenue
                    : 0.7,
                ),
              },
            ]}
          />
          <View
            style={[
              styles.splitBarCost,
              {
                flex: Math.max(
                  0.05,
                  aggregateMetrics.totalRevenue > 0
                    ? aggregateMetrics.totalExpenses / aggregateMetrics.totalRevenue
                    : 0.3,
                ),
              },
            ]}
          />
        </View>

        {/* CHART LEGEND ROW */}
        <View style={styles.chartLegendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ui.emerald }]} />
            <Text style={styles.legendText}>
              Basic Profit: <Text style={styles.legendBold}>{money(aggregateMetrics.basicProfit)}</Text> ({aggregateMetrics.profitMargin}%)
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ui.danger }]} />
            <Text style={styles.legendText}>
              Recorded Costs: <Text style={styles.legendBold}>{money(aggregateMetrics.totalExpenses)}</Text> ({aggregateMetrics.expenseRatio}%)
            </Text>
          </View>
        </View>

        {/* TRIP-WISE COMPARATIVE BAR CHART (IF MULTIPLE TRIPS) */}
        {filteredTrips.length > 1 && (
          <View style={styles.miniBarGraphSection}>
            <Text style={styles.miniBarSectionTitle}>
              Voyage-by-Voyage Comparison (Revenue vs Expenses)
            </Text>
            <View style={styles.barGraphRow}>
              {filteredTrips.slice(0, 5).map((t) => {
                const fin = computeTripFinances(t);
                const revHeight = Math.max(16, Math.min(80, (fin.revenue / maxTripRevenue) * 80));
                const expHeight = Math.max(10, Math.min(80, (fin.expenses / maxTripRevenue) * 80));

                return (
                  <Pressable
                    key={t.id}
                    accessibilityRole="button"
                    onPress={() => handleViewTrip(t.id)}
                    style={styles.barGroup}
                  >
                    <View style={styles.barsContainer}>
                      <View style={[styles.barRev, { height: revHeight }]} />
                      <View style={[styles.barExp, { height: expHeight }]} />
                    </View>
                    <Text numberOfLines={1} style={styles.barTripLabel}>
                      {t.tripNumber}
                    </Text>
                    <Text style={styles.barProfitText}>
                      {fin.marginPercent}%
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.barGraphKey}>
              <View style={styles.keyItem}>
                <View style={[styles.keyColor, { backgroundColor: ui.teal }]} />
                <Text style={styles.keyLabel}>Revenue</Text>
              </View>
              <View style={styles.keyItem}>
                <View style={[styles.keyColor, { backgroundColor: ui.danger }]} />
                <Text style={styles.keyLabel}>Expenses</Text>
              </View>
              <Text style={styles.keyTapHint}>Tap a voyage bar to view details (S13)</Text>
            </View>
          </View>
        )}
      </View>

      {/* COST CATEGORIES SUMMARY */}
      <SectionHeader
        title="Cost Category Breakdown"
        subtitle="Where voyage operational funds are allocated"
      />

      <View style={styles.costBreakdownCard}>
        {/* FUEL */}
        <View style={styles.costItemRow}>
          <View style={styles.costIconBox}>
            <Text style={styles.costEmoji}>⛽</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.costTitleRow}>
              <Text style={styles.costTitle}>Marine Diesel Fuel</Text>
              <Text style={styles.costValue}>{money(aggregateMetrics.totalFuel)}</Text>
            </View>
            <Text style={styles.costSub}>Boat engine propulsion & generator fuel</Text>
            <View style={styles.costTrack}>
              <View
                style={[
                  styles.costFill,
                  {
                    width: `${
                      aggregateMetrics.totalExpenses > 0
                        ? Math.min(100, Math.round((aggregateMetrics.totalFuel / aggregateMetrics.totalExpenses) * 100))
                        : 55
                    }%`,
                    backgroundColor: ui.teal,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.costDivider} />

        {/* ICE & BAIT */}
        <View style={styles.costItemRow}>
          <View style={styles.costIconBox}>
            <Text style={styles.costEmoji}>🧊</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.costTitleRow}>
              <Text style={styles.costTitle}>Crushed Ice Blocks & Live Bait</Text>
              <Text style={styles.costValue}>{money(aggregateMetrics.totalIceBait)}</Text>
            </View>
            <Text style={styles.costSub}>Cold storage crates, squid and sardine bait</Text>
            <View style={styles.costTrack}>
              <View
                style={[
                  styles.costFill,
                  {
                    width: `${
                      aggregateMetrics.totalExpenses > 0
                        ? Math.min(100, Math.round((aggregateMetrics.totalIceBait / aggregateMetrics.totalExpenses) * 100))
                        : 28
                    }%`,
                    backgroundColor: '#D97706',
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.costDivider} />

        {/* HARBOR & BOAT EXPENSES */}
        <View style={styles.costItemRow}>
          <View style={styles.costIconBox}>
            <Text style={styles.costEmoji}>⚓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.costTitleRow}>
              <Text style={styles.costTitle}>Harbor Docking, Levies & Maintenance</Text>
              <Text style={styles.costValue}>
                {money(aggregateMetrics.totalHarborOther)}
              </Text>
            </View>
            <Text style={styles.costSub}>Fishery harbor pier permits, crew rations & gear</Text>
            <View style={styles.costTrack}>
              <View
                style={[
                  styles.costFill,
                  {
                    width: `${
                      aggregateMetrics.totalExpenses > 0
                        ? Math.min(100, Math.round((aggregateMetrics.totalHarborOther / aggregateMetrics.totalExpenses) * 100))
                        : 17
                    }%`,
                    backgroundColor: '#7C3AED',
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* 01. TRIP-WISE BREAKDOWN (ITEMIZED VOYAGES LIST) */}
      <SectionHeader
        title="Trip-Wise Breakdown"
        subtitle="Individual voyage profit, revenue & expense audit"
        count={filteredTrips.length}
      />

      {filteredTrips.length === 0 ? (
        <EmptyStateCard
          title="No Voyages Match Filter"
          description="Try selecting 'All Voyages' or adjust your date filter."
          icon="clock"
          actionText="Reset to All Voyages"
          onAction={() => {
            setDateFilter('all');
            setFocusedTripId('all');
          }}
        />
      ) : (
        <View style={styles.tripsListContainer}>
          {filteredTrips.map((trip) => {
            const fin = computeTripFinances(trip);
            const isAtSea = trip.status === 'ongoing';

            return (
              <View key={trip.id} style={styles.tripCard}>
                {/* TRIP CARD HEADER */}
                <View style={styles.tripCardHeader}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.tripBadgeRow}>
                      <View style={styles.tripNumberPill}>
                        <Text style={styles.tripNumberText}>{trip.tripNumber}</Text>
                      </View>
                      <View
                        style={[
                          styles.tripStatusPill,
                          isAtSea ? styles.statusAtSea : styles.statusCompleted,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tripStatusText,
                            isAtSea ? styles.statusAtSeaText : styles.statusCompletedText,
                          ]}
                        >
                          {isAtSea ? '● At Sea' : '✓ Completed'}
                        </Text>
                      </View>
                    </View>

                    <Text numberOfLines={1} style={styles.tripBoatLocation}>
                      {trip.boatName || profile.boatName} · {trip.harbor}
                    </Text>
                    <Text style={styles.tripDates}>
                      Departure: {trip.departureDate}
                      {trip.returnDate ? ` · Return: ${trip.returnDate}` : ''}
                    </Text>
                  </View>
                </View>

                {/* TRIP KPI MATRIX */}
                <View style={styles.tripKpiMatrix}>
                  {/* HAUL */}
                  <View style={styles.matrixCell}>
                    <Text style={styles.matrixLabel}>Landed Haul</Text>
                    <Text style={styles.matrixValue}>{fin.catchKg.toFixed(1)} kg</Text>
                    <Text style={styles.matrixSub}>{fin.salesCount} sales</Text>
                  </View>

                  <View style={styles.matrixDivider} />

                  {/* REVENUE */}
                  <View style={styles.matrixCell}>
                    <Text style={styles.matrixLabel}>Revenue</Text>
                    <Text style={styles.matrixValueGreen}>{money(fin.revenue)}</Text>
                    <Text style={styles.matrixSub}>Gross haul</Text>
                  </View>

                  <View style={styles.matrixDivider} />

                  {/* EXPENSES */}
                  <View style={styles.matrixCell}>
                    <Text style={styles.matrixLabel}>Expenses</Text>
                    <Text style={styles.matrixValueRed}>− {money(fin.expenses)}</Text>
                    <Text style={styles.matrixSub}>{fin.expensesCount} costs</Text>
                  </View>

                  <View style={styles.matrixDivider} />

                  {/* 03. BASIC PROFIT */}
                  <View style={styles.matrixCell}>
                    <Text style={styles.matrixLabel}>Basic Profit</Text>
                    <Text
                      style={[
                        styles.matrixValueProfit,
                        fin.basicProfit >= 0 ? styles.profitPos : styles.profitNeg,
                      ]}
                    >
                      {money(fin.basicProfit)}
                    </Text>
                    <Text style={styles.matrixMarginPill}>
                      {fin.marginPercent}% margin
                    </Text>
                  </View>
                </View>

                {/* 02. BUTTONS & NAVIGATION: VIEW TRIP -> S13 */}
                <View style={styles.tripCardActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`View trip details for ${trip.tripNumber}`}
                    onPress={() => handleViewTrip(trip.id)}
                    style={styles.viewTripBtn}
                  >
                    <Text style={styles.viewTripBtnText}>View Trip Details (S13)</Text>
                    <FishermanIcon name="chevron-right" size={14} color="#FFFFFF" />
                  </Pressable>

                  {/* SHORTCUTS TO RELATED SCREENS */}
                  <View style={styles.shortcutRow}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        router.push({
                          pathname: '/fisherman/s15' as never,
                          params: { tripId: trip.id },
                        })
                      }
                      style={styles.shortcutChip}
                    >
                      <Text style={styles.shortcutChipText}>Catches (S15)</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        router.push({
                          pathname: '/fisherman/s17' as never,
                          params: { tripId: trip.id },
                        })
                      }
                      style={styles.shortcutChip}
                    >
                      <Text style={styles.shortcutChipText}>Expenses (S17)</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        router.push({
                          pathname: '/fisherman/s19' as never,
                          params: { tripId: trip.id },
                        })
                      }
                      style={styles.shortcutChip}
                    >
                      <Text style={styles.shortcutChipText}>Sales (S19)</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 02. BUTTONS & NAVIGATION: BACK -> S01 ACTION FOOTER */}
      <View style={styles.footerSection}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Dashboard (S01)"
          onPress={handleBackToS01}
          style={styles.backDashboardBtn}
        >
          <FishermanIcon name="home" size={18} color={ui.navy} />
          <Text style={styles.backDashboardText}>Back to Dashboard (S01)</Text>
        </Pressable>
        <Text style={styles.footerSub}>
          FishMate Fisherman Operational Suite · Screen S21
        </Text>
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
    backgroundColor: ui.tealDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  screenTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  helperText: {
    fontSize: 11,
    color: ui.muted,
    flex: 1,
  },
  filterSection: {
    marginBottom: 14,
  },
  filterSectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  tripSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  resetFocusText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: ui.border,
  },
  filterChipActive: {
    backgroundColor: ui.teal,
    borderColor: ui.teal,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  tripFocusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: ui.border,
  },
  tripFocusChipActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  tripFocusText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  tripFocusTextActive: {
    color: '#FFFFFF',
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  financeHeroContainer: {
    marginBottom: 14,
  },
  basicProfitCard: {
    backgroundColor: '#FAFDFD',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CDE5E2',
    shadowColor: ui.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profitBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profitEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: ui.muted,
  },
  basicPill: {
    backgroundColor: ui.emeraldSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  basicPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.emerald,
    letterSpacing: 0.5,
  },
  basicProfitAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: -0.6,
    marginTop: 3,
  },
  marginBadgeWrap: {
    alignItems: 'center',
    backgroundColor: ui.emeraldSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  marginBadgeValue: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.emerald,
  },
  marginBadgeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.emerald,
  },
  formulaBanner: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginTop: 10,
  },
  formulaTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#166534',
  },
  formulaSub: {
    fontSize: 10,
    color: '#15803D',
    marginTop: 2,
    lineHeight: 14,
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  dualKpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kpiColumn: {
    flex: 1,
  },
  kpiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  kpiLabel: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '800',
  },
  kpiAmountGreen: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.tealDark,
    marginTop: 3,
  },
  kpiAmountRed: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.danger,
    marginTop: 3,
  },
  growthBadge: {
    marginTop: 3,
  },
  growthBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.success,
  },
  expenseRatioText: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.danger,
    marginTop: 3,
  },
  kpiColumnDivider: {
    width: 1,
    height: 44,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  chartCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  chartSubtitle: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 1,
  },
  chartTagPill: {
    backgroundColor: ui.bg,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chartTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.8,
  },
  splitBarContainer: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  splitBarProfit: {
    backgroundColor: ui.emerald,
  },
  splitBarCost: {
    backgroundColor: ui.danger,
  },
  chartLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: ui.navy,
  },
  legendBold: {
    fontWeight: '900',
  },
  miniBarGraphSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ui.borderSubtle,
  },
  miniBarSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.muted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  barGraphRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 95,
    paddingBottom: 4,
  },
  barGroup: {
    alignItems: 'center',
    width: 52,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 80,
  },
  barRev: {
    width: 14,
    backgroundColor: ui.teal,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barExp: {
    width: 14,
    backgroundColor: '#F87171',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barTripLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 4,
  },
  barProfitText: {
    fontSize: 8,
    fontWeight: '900',
    color: ui.emerald,
  },
  barGraphKey: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ui.borderSubtle,
  },
  keyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  keyColor: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  keyLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.muted,
  },
  keyTapHint: {
    fontSize: 9,
    color: ui.muted,
    fontStyle: 'italic',
  },
  costBreakdownCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
  },
  costItemRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  costIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: ui.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  costEmoji: {
    fontSize: 18,
  },
  costTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.navy,
  },
  costValue: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  costSub: {
    fontSize: 9,
    color: ui.muted,
    marginTop: 1,
  },
  costTrack: {
    height: 5,
    backgroundColor: ui.bg,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  costFill: {
    height: '100%',
    borderRadius: 3,
  },
  costDivider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 10,
  },
  tripsListContainer: {
    gap: 12,
    marginBottom: 16,
  },
  tripCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  tripCardHeader: {
    marginBottom: 10,
  },
  tripBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tripNumberPill: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tripNumberText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.tealDark,
  },
  tripStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tripStatusText: {
    fontSize: 10,
    fontWeight: '900',
  },
  statusCompleted: {
    backgroundColor: '#ECFDF5',
  },
  statusCompletedText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '900',
  },
  statusAtSea: {
    backgroundColor: '#FEF3C7',
  },
  statusAtSeaText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '900',
  },
  tripBoatLocation: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  tripDates: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 1,
  },
  tripKpiMatrix: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  matrixCell: {
    flex: 1,
    alignItems: 'center',
  },
  matrixLabel: {
    fontSize: 9,
    color: ui.muted,
    fontWeight: '800',
  },
  matrixValue: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 1,
  },
  matrixValueGreen: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.tealDark,
    marginTop: 1,
  },
  matrixValueRed: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.danger,
    marginTop: 1,
  },
  matrixValueProfit: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 1,
  },
  profitPos: {
    color: ui.emerald,
  },
  profitNeg: {
    color: ui.danger,
  },
  matrixSub: {
    fontSize: 8,
    color: ui.muted,
    marginTop: 1,
  },
  matrixMarginPill: {
    fontSize: 8,
    fontWeight: '900',
    color: ui.emerald,
    marginTop: 1,
  },
  matrixDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  tripCardActions: {
    marginTop: 6,
    gap: 8,
  },
  viewTripBtn: {
    backgroundColor: ui.teal,
    borderRadius: 12,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  viewTripBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  shortcutChip: {
    flex: 1,
    backgroundColor: ui.bg,
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.borderSubtle,
  },
  shortcutChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.tealDark,
  },
  footerSection: {
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
    gap: 8,
  },
  backDashboardBtn: {
    backgroundColor: ui.surface,
    borderWidth: 1.5,
    borderColor: ui.border,
    borderRadius: 16,
    height: 48,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  backDashboardText: {
    color: ui.navy,
    fontSize: 13,
    fontWeight: '900',
  },
  footerSub: {
    fontSize: 10,
    color: ui.muted,
  },
});
