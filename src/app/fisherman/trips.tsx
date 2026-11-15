import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { EmptyStateCard, SectionHeader, money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { FishingTrip } from '@/types';

type DateFilterType = 'all' | 'this_week' | 'this_month' | 'past';

const DATE_FILTERS: { key: DateFilterType; label: string }[] = [
  { key: 'all', label: 'All Trips' },
  { key: 'this_week', label: 'This Week' },
  { key: 'this_month', label: 'This Month' },
  { key: 'past', label: 'Past Trips' },
];

export default function FishermanTripsScreen() {
  const { trips, profile } = useFisherman();
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');

  // Filter trips based on date filter
  const filteredTrips = trips.filter((trip) => {
    if (dateFilter === 'this_week') {
      return (
        trip.departureDate.toLowerCase().includes('today') ||
        trip.departureDate.toLowerCase().includes('yesterday') ||
        trip.departureDate.toLowerCase().includes('nov')
      );
    }
    if (dateFilter === 'this_month') {
      return (
        trip.departureDate.toLowerCase().includes('today') ||
        trip.departureDate.toLowerCase().includes('yesterday') ||
        trip.departureDate.toLowerCase().includes('nov') ||
        trip.departureDate.toLowerCase().includes('tomorrow')
      );
    }
    if (dateFilter === 'past') {
      return trip.status === 'completed';
    }
    return true;
  });

  // 03. TRIP-WISE SUMMARY WHEN RECORDS AVAILABLE
  const completedTrips = trips.filter((t) => t.status === 'completed');
  const totalCatchKg = completedTrips.reduce((sum, t) => sum + t.catchVolumeKg, 0);

  // Calculate aggregate revenue, expenses, and profit across trips
  const totalExpenses = completedTrips.reduce(
    (sum, t) => sum + (t.fuelCost + t.iceBaitCost + t.otherCost),
    0,
  );
  const totalRevenue = completedTrips.reduce(
    (sum, t) => sum + (t.revenue ?? Math.round(t.catchVolumeKg * 1250)),
    0,
  );
  const totalProfit = totalRevenue - totalExpenses;
  const overallMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  // 02. BUTTONS & NAVIGATION: ADD NEW TRIP -> S12
  const handleAddNewTrip = () => {
    router.push('/fisherman/s12' as never);
  };

  // 02. BUTTONS & NAVIGATION: TRIP CARD -> S13
  const handleOpenTripDetails = (trip: FishingTrip) => {
    router.push({
      pathname: '/fisherman/s13',
      params: { id: trip.id },
    } as never);
  };

  return (
    <FishermanShell
      title="My Fishing Trips"
      subtitle="Boat voyages, catch yield & profitability"
      rightIcon="clock"
      rightLabel="Add Trip (S12)"
      onRightPress={handleAddNewTrip}
    >
      {/* SCREEN BREADCRUMB */}
      <View style={styles.breadcrumbRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S11</Text>
        </View>
        <Text numberOfLines={1} style={styles.breadcrumbText}>
          Sea voyages log, fuel costs & haul yield
        </Text>
      </View>

      {/* 03. TRIP-WISE SUMMARY CARD (WHEN RECORDS ARE AVAILABLE) */}
      <View style={styles.kpiCard}>
        {/* ROW 1: HAUL & LOG TRIP BUTTON */}
        <View style={styles.kpiTopRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.kpiEyebrow}>SEASON CATCH VOLUME</Text>
            <Text style={styles.kpiMain}>{totalCatchKg.toFixed(1)} KG Landed</Text>
            <Text style={styles.kpiSub}>
              Across {completedTrips.length} completed sea voyages
            </Text>
          </View>

          {/* 02. + ADD NEW TRIP BUTTON */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add New Trip (S12)"
            onPress={handleAddNewTrip}
            style={styles.newTripBtn}
          >
            <FishermanIcon name="plus" size={15} color="#FFFFFF" />
            <Text style={styles.newTripBtnText}>+ Add Trip</Text>
          </Pressable>
        </View>

        <View style={styles.cardDivider} />

        {/* ROW 2: REVENUE, EXPENSES & NET PROFIT SUMMARY */}
        <View style={styles.summaryFinancialsGrid}>
          {/* GROSS REVENUE */}
          <View style={styles.financialTile}>
            <Text style={styles.finTileLabel}>GROSS CATCH SALES</Text>
            <Text numberOfLines={1} style={styles.finTileValue}>
              {money(totalRevenue)}
            </Text>
            <Text style={styles.finTileSub}>Harbor landed catch</Text>
          </View>

          {/* TOTAL EXPENSES */}
          <View style={styles.financialTile}>
            <Text style={styles.finTileLabel}>TRIP EXPENSES</Text>
            <Text numberOfLines={1} style={[styles.finTileValue, { color: '#DC2626' }]}>
              {money(totalExpenses)}
            </Text>
            <Text style={styles.finTileSub}>Fuel, ice & harbor</Text>
          </View>

          {/* NET VOYAGE PROFIT */}
          <View style={[styles.financialTile, styles.profitHighlightTile]}>
            <View style={styles.profitHeaderRow}>
              <Text style={styles.finTileLabel}>NET PROFIT</Text>
              <View style={styles.marginBadge}>
                <Text style={styles.marginBadgeText}>{overallMargin}%</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={[styles.finTileValue, { color: '#059669' }]}>
              +{money(totalProfit)}
            </Text>
            <Text style={styles.finTileSub}>Net vessel income</Text>
          </View>
        </View>
      </View>

      {/* 01. DATE FILTER TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateFilterScroll}
      >
        {DATE_FILTERS.map((tab) => {
          const isSelected = dateFilter === tab.key;
          const count =
            tab.key === 'all'
              ? trips.length
              : tab.key === 'past'
              ? trips.filter((t) => t.status === 'completed').length
              : trips.length;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setDateFilter(tab.key)}
              style={[styles.dateFilterChip, isSelected && styles.dateFilterChipActive]}
            >
              <Text
                style={[
                  styles.dateFilterText,
                  isSelected && styles.dateFilterTextActive,
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.filterCountBadge,
                  isSelected && styles.filterCountBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    isSelected && styles.filterCountTextActive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* SECTION HEADER */}
      <SectionHeader
        title={
          dateFilter === 'all'
            ? 'All Sea Voyages'
            : dateFilter === 'this_week'
            ? 'This Week Voyages'
            : dateFilter === 'this_month'
            ? 'This Month Voyages'
            : 'Past Completed Voyages'
        }
        subtitle="Sorted by departure date · Tap any card for full details (S13)"
        count={filteredTrips.length}
      />

      {/* 03. TRIP EMPTY STATE */}
      {filteredTrips.length === 0 ? (
        <EmptyStateCard
          icon="clock"
          title="No sea voyages found"
          description="Track boat departures, zone depths, diesel litrage and catch yield to calculate exact vessel net profit."
          actionText="+ Log New Voyage (S12)"
          onAction={handleAddNewTrip}
        />
      ) : (
        /* 01. TRIP LIST SORTED BY DATE */
        filteredTrips.map((trip) => {
          const isCompleted = trip.status === 'completed';
          const isOngoing = trip.status === 'ongoing';

          // Calculate trip-level financials
          const tripExp = trip.fuelCost + trip.iceBaitCost + trip.otherCost;
          const tripRev = trip.revenue ?? (trip.catchVolumeKg > 0 ? Math.round(trip.catchVolumeKg * 1250) : 0);
          const tripNet = isCompleted ? trip.profit ?? (tripRev - tripExp) : 0;
          const tripMargin = tripRev > 0 ? Math.round((tripNet / tripRev) * 100) : 0;

          return (
            <Pressable
              key={trip.id}
              accessibilityRole="button"
              accessibilityLabel={`Trip ${trip.tripNumber}`}
              onPress={() => handleOpenTripDetails(trip)}
              style={styles.tripCard}
            >
              {/* TOP ROW: NUMBER, BOAT INFO & STATUS */}
              <View style={styles.tripTopRow}>
                <View style={styles.tripNumberBadge}>
                  <Text style={styles.tripNumberText}>{trip.tripNumber}</Text>
                </View>

                {/* 01. BOAT INFO & LOCATION */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={styles.boatTitle}>
                    {trip.boatName || profile.boatName || 'Sagara Rani II'}
                  </Text>
                  <View style={styles.locationZoneRow}>
                    <FishermanIcon name="pin" size={11} color={ui.tealDark} />
                    <Text numberOfLines={1} style={styles.locationZoneText}>
                      {trip.harbor}
                    </Text>
                  </View>
                </View>

                {/* STATUS BADGE */}
                <View
                  style={[
                    styles.tripStatusPill,
                    isCompleted
                      ? styles.statusCompleted
                      : isOngoing
                      ? styles.statusOngoing
                      : styles.statusPlanned,
                  ]}
                >
                  <Text
                    style={[
                      styles.tripStatusText,
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

              {/* DATES ROW */}
              <View style={styles.departureDateRow}>
                <FishermanIcon name="clock" size={12} color={ui.muted} />
                <Text style={styles.departureDateText}>
                  {trip.departureDate} → {trip.returnDate}
                </Text>
              </View>

              {/* 01. HAUL WEIGHT & TARGET SPECIES CHIPS */}
              <View style={styles.haulCardRow}>
                <View style={styles.haulBadge}>
                  <Text style={styles.haulWeightText}>
                    {trip.catchVolumeKg > 0 ? `${trip.catchVolumeKg.toFixed(1)} KG` : 'Voyage Active'}
                  </Text>
                  <Text style={styles.haulLabel}>Catch Landed</Text>
                </View>

                <View style={styles.speciesTagsWrap}>
                  {(trip.targetSpecies ?? ['Yellowfin Tuna', 'Pelagic Catch']).map((sp, idx) => (
                    <View key={idx} style={styles.speciesPill}>
                      <Text style={styles.speciesPillText}>#{sp}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* 01. REVENUE / EXPENSES / PROFIT PREVIEW */}
              <View style={styles.tripFinancialRow}>
                {/* GROSS REVENUE */}
                <View style={styles.finPreviewCol}>
                  <Text style={styles.finPreviewLabel}>REVENUE</Text>
                  <Text style={styles.finPreviewRev}>
                    {tripRev > 0 ? money(tripRev) : 'Pending'}
                  </Text>
                </View>

                {/* EXPENSES */}
                <View style={styles.finPreviewCol}>
                  <Text style={styles.finPreviewLabel}>EXPENSES</Text>
                  <Text style={styles.finPreviewExp}>
                    {money(tripExp)}
                  </Text>
                </View>

                {/* NET PROFIT */}
                <View style={styles.finPreviewColRight}>
                  <View style={styles.profitBadgeRow}>
                    <Text style={styles.finPreviewLabel}>NET PROFIT</Text>
                    {isCompleted && tripMargin > 0 ? (
                      <View style={styles.microMarginBadge}>
                        <Text style={styles.microMarginText}>{tripMargin}%</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.finPreviewProfit,
                      tripNet < 0 && { color: ui.danger },
                    ]}
                  >
                    {isCompleted ? `+${money(tripNet)}` : 'In Voyage'}
                  </Text>
                </View>
              </View>

              {/* 02. CLICK ACTION: TRIP CARD -> S13 */}
              <View style={styles.cardFooterRow}>
                <Text style={styles.cardFooterText}>
                  View Voyage Log & Catch Yield (S13) →
                </Text>
                <FishermanIcon name="chevron-right" size={14} color={ui.tealDark} />
              </View>
            </Pressable>
          );
        })
      )}
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

  // 03. SUMMARY KPI CARD
  kpiCard: {
    backgroundColor: ui.surface,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 14,
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  kpiEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: ui.tealDark,
  },
  kpiMain: {
    fontSize: 22,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  newTripBtn: {
    backgroundColor: ui.tealDark,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  newTripBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardDivider: {
    height: 1,
    backgroundColor: ui.border,
    marginVertical: 12,
  },
  summaryFinancialsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  financialTile: {
    flex: 1,
    backgroundColor: '#F8FCFD',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3F1F4',
  },
  profitHighlightTile: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  finTileLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.9,
  },
  finTileValue: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 4,
  },
  finTileSub: {
    fontSize: 9,
    color: ui.muted,
    marginTop: 2,
  },
  profitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marginBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  marginBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },

  // 01. DATE FILTERS
  dateFilterScroll: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 10,
  },
  dateFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: ui.border,
  },
  dateFilterChipActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  dateFilterText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.muted,
  },
  dateFilterTextActive: {
    color: '#FFFFFF',
  },
  filterCountBadge: {
    backgroundColor: '#EBF4F6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  filterCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.navy,
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },

  // TRIP CARDS
  tripCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 12,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  tripTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tripNumberBadge: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tripNumberText: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.tealDark,
  },
  boatTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  locationZoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationZoneText: {
    fontSize: 11,
    color: ui.muted,
  },
  tripStatusPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusCompleted: {
    backgroundColor: '#ECFDF5',
  },
  statusOngoing: {
    backgroundColor: '#E0F2FE',
  },
  statusPlanned: {
    backgroundColor: '#FFFBEB',
  },
  tripStatusText: {
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
  departureDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  departureDateText: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '600',
  },

  // HAUL & SPECIES
  haulCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FCFD',
    padding: 10,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EBF4F6',
  },
  haulBadge: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  haulWeightText: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.tealDark,
  },
  haulLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: ui.tealDark,
    marginTop: 1,
  },
  speciesTagsWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  speciesPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4EEF2',
  },
  speciesPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },

  // FINANCIAL PREVIEW ROW
  tripFinancialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  finPreviewCol: {
    flex: 1,
  },
  finPreviewColRight: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  finPreviewLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.8,
  },
  finPreviewRev: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  finPreviewExp: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 2,
  },
  profitBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  microMarginBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  microMarginText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#059669',
  },
  finPreviewProfit: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },

  // CARD FOOTER
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F6',
  },
  cardFooterText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
});
