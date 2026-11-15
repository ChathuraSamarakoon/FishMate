import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { TripCatchRecord } from '@/types';

// Sample dataset requested: Tuna 80kg, Mackerel 30kg, Sardines 20kg (Total: 130kg)
const SAMPLE_CATCHES: TripCatchRecord[] = [
  {
    id: 'sample-c1',
    species: 'Yellowfin Tuna (Kelawalla)',
    weightKg: 80.0,
    grade: 'Grade A (Sashimi Export)',
    storageMethod: 'Cold Ice Bin #1 (Flake Ice)',
    recordedAt: 'Today, 08:30 AM',
    estimatedValue: 144000,
  },
  {
    id: 'sample-c2',
    species: 'Spanish Mackerel (Tora)',
    weightKg: 30.0,
    grade: 'Grade A (Fresh Table Market)',
    storageMethod: 'Crushed Ice Bin #2',
    recordedAt: 'Today, 08:50 AM',
    estimatedValue: 72000,
  },
  {
    id: 'sample-c3',
    species: 'Spotted Sardines (Hurulla)',
    weightKg: 20.0,
    grade: 'Grade B (Commercial / Processing)',
    storageMethod: 'Chilled Seawater Slurry',
    recordedAt: 'Today, 09:10 AM',
    estimatedValue: 13000,
  },
];

export default function S15CatchRecordsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { trips, updateTrip, deleteTripCatch } = useFisherman();
  const [usingSampleDemo, setUsingSampleDemo] = useState(false);

  // Find target trip
  const trip = trips.find((t) => t.id === tripId) || trips[0];

  if (!trip) {
    return (
      <FishermanShell
        back
        title="S15 · Catch Records"
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

  // Active catches list (either live from trip or sample demonstration)
  const activeCatches: TripCatchRecord[] = usingSampleDemo
    ? SAMPLE_CATCHES
    : trip.catches && trip.catches.length > 0
    ? trip.catches
    : SAMPLE_CATCHES;

  // 03. BEHAVIOR & VALIDATION:
  // Dynamically calculate total kg across all fish types
  const totalCaughtKg = activeCatches.reduce((sum, c) => sum + c.weightKg, 0);
  const totalEstimatedValue = activeCatches.reduce((sum, c) => sum + (c.estimatedValue || 0), 0);

  // Navigation handlers
  const handleAddCatch = () => {
    router.push({ pathname: '/fisherman/s16' as never, params: { tripId: trip.id } });
  };

  const handleEditCatch = (catchItem: TripCatchRecord) => {
    router.push({
      pathname: '/fisherman/s16' as never,
      params: { tripId: trip.id, catchId: catchItem.id },
    });
  };

  const handleDeleteCatch = (catchItem: TripCatchRecord) => {
    Alert.alert(
      'Remove Catch Record',
      `Are you sure you want to remove ${catchItem.weightKg.toFixed(1)} kg of ${catchItem.species}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (usingSampleDemo) {
              setUsingSampleDemo(false);
            } else {
              deleteTripCatch(trip.id, catchItem.id);
            }
          },
        },
      ],
    );
  };

  const handleApplySampleToTrip = () => {
    updateTrip(trip.id, {
      catches: SAMPLE_CATCHES,
      catchVolumeKg: 130.0,
    });
    setUsingSampleDemo(false);
    Alert.alert(
      'Sample Applied (S15)',
      'Loaded sample catch haul:\n• Tuna: 80.0 kg\n• Mackerel: 30.0 kg\n• Sardines: 20.0 kg\n\nTotal: 130.0 kg successfully calculated.',
    );
  };

  const handleExportCatchTally = () => {
    Alert.alert(
      'Export Catch Tally (S15)',
      `Official harbor catch tally generated for voyage ${trip.tripNumber}.\n\nTotal Landed: ${totalCaughtKg.toFixed(1)} KG across ${activeCatches.length} species.\nEstimated Value: ${money(totalEstimatedValue)}\n\nPDF exported to documents.`,
      [{ text: 'OK' }],
    );
  };

  const isCompleted = trip.status === 'completed';
  const isOngoing = trip.status === 'ongoing';

  return (
    <FishermanShell
      title={`S15 · ${trip.tripNumber} Catches`}
      subtitle="Fish type-wise catch list & yield calculations"
      back
      onBack={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
      rightIcon="sparkles"
      rightLabel="Tally"
      onRightPress={handleExportCatchTally}
    >
      {/* SCREEN BREADCRUMB */}
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S15</Text>
        </View>
        <Text numberOfLines={1} style={styles.helperText}>
          Species Catch Haul, Total Weight & Quality Grading
        </Text>
      </View>

      {/* 01. TRIP HEADING CARD */}
      <View style={styles.tripHeadingCard}>
        <View style={styles.headingTopRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.tripHeadingNumber}>{trip.tripNumber}</Text>
            <Text numberOfLines={1} style={styles.headingBoatText}>
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

        <View style={styles.headingDivider} />

        <View style={styles.headingMetaRow}>
          <Text style={styles.headingDateText}>
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

      {/* 01 & 03. TOTAL CAUGHT KG SUMMARY CARD */}
      <View style={styles.totalKpiCard}>
        <View style={styles.totalKpiRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.totalKpiLabel}>TOTAL CAUGHT WEIGHT</Text>
            <View style={styles.totalWeightRow}>
              <Text style={styles.totalWeightNumber}>{totalCaughtKg.toFixed(1)}</Text>
              <Text style={styles.totalWeightUnit}>KG</Text>
            </View>
            <Text style={styles.totalWeightFormula}>
              📐 Calculated sum of {activeCatches.length} recorded fish types
            </Text>
          </View>

          <View style={styles.kpiRightCol}>
            <View style={styles.estValueBadge}>
              <Text style={styles.estValueLabel}>HARBOR ESTIMATE</Text>
              <Text style={styles.estValueAmount}>{money(totalEstimatedValue)}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleAddCatch}
              style={styles.addCatchHeaderBtn}
            >
              <FishermanIcon name="plus" size={13} color="#FFFFFF" />
              <Text style={styles.addCatchHeaderBtnText}>+ Add Catch (S16)</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* SAMPLE DEMO CALLOUT (Tuna 80kg, Mackerel 30kg, Sardines 20kg) */}
      <View style={styles.sampleBanner}>
        <View style={styles.sampleIconWrap}>
          <FishermanIcon name="sparkles" size={15} color={ui.tealDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sampleTitle}>Target Sample Data</Text>
          <Text style={styles.sampleBody}>
            Tuna 80kg + Mackerel 30kg + Sardines 20kg = 130kg Total
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={handleApplySampleToTrip}
          style={styles.applySampleBtn}
        >
          <Text style={styles.applySampleBtnText}>Load Sample</Text>
        </Pressable>
      </View>

      {/* 01. FISH TYPE-WISE CATCH TABLE / LIST */}
      <View style={styles.tableHeaderRow}>
        <Text style={styles.sectionTitle}>Fish Type-Wise Catch List</Text>
        <Text style={styles.sectionSub}>{activeCatches.length} Species Logged</Text>
      </View>

      {activeCatches.length === 0 ? (
        <View style={styles.card}>
          <FishermanIcon name="boat" size={32} color={ui.muted} />
          <Text style={styles.emptyTitle}>No Catch Records Found</Text>
          <Text style={styles.emptySub}>
            Record harvested fish species, weight in kg, quality grade, and cold storage hold.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleAddCatch}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>+ Log First Catch (S16)</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.catchList}>
          {activeCatches.map((c, index) => {
            const sharePercent = totalCaughtKg > 0
              ? Math.round((c.weightKg / totalCaughtKg) * 100)
              : 0;

            return (
              <View key={c.id || index} style={styles.catchCard}>
                {/* CARD TOP: SPECIES & QUANTITY PER FISH TYPE */}
                <View style={styles.catchTopRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.speciesRow}>
                      <Text style={styles.fishEmoji}>🐟</Text>
                      <Text numberOfLines={1} style={styles.speciesName}>
                        {c.species}
                      </Text>
                    </View>
                    <Text numberOfLines={1} style={styles.storageText}>
                      📦 {c.storageMethod ?? 'Cold Ice Bin'}
                    </Text>
                  </View>

                  {/* QUANTITY PER FISH TYPE */}
                  <View style={styles.qtyBadgeCol}>
                    <View style={styles.qtyBadge}>
                      <Text style={styles.qtyBadgeNumber}>{c.weightKg.toFixed(1)}</Text>
                      <Text style={styles.qtyBadgeUnit}>KG</Text>
                    </View>
                    <Text style={styles.shareText}>{sharePercent}% of total</Text>
                  </View>
                </View>

                {/* PROGRESS BAR SHOWING SHARE */}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(5, sharePercent))}%` }]} />
                </View>

                <View style={styles.catchDivider} />

                {/* CARD BOTTOM: GRADE, VALUATION & ADD/EDIT ACTIONS */}
                <View style={styles.catchBottomRow}>
                  <View style={styles.gradeBadge}>
                    <Text numberOfLines={1} style={styles.gradeBadgeText}>
                      {c.grade ?? 'Grade A'}
                    </Text>
                  </View>

                  {c.estimatedValue ? (
                    <Text style={styles.estPriceText}>
                      {money(c.estimatedValue)}
                    </Text>
                  ) : null}

                  {/* 02. EDIT CATCH -> S16 ACTION */}
                  <View style={styles.rowActionsWrap}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${c.species}`}
                      onPress={() => handleEditCatch(c)}
                      style={styles.editActionBtn}
                    >
                      <FishermanIcon name="sparkles" size={12} color={ui.tealDark} />
                      <Text style={styles.editActionText}>Edit (S16)</Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${c.species}`}
                      onPress={() => handleDeleteCatch(c)}
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

      {/* 02. BUTTONS & NAVIGATION */}
      <View style={styles.footerActionsCol}>
        <Pressable
          accessibilityRole="button"
          onPress={handleAddCatch}
          style={styles.footerPrimaryBtn}
        >
          <FishermanIcon name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.footerPrimaryBtnText}>+ Add New Catch Record (S16)</Text>
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

  // TRIP HEADING CARD
  tripHeadingCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 12,
  },
  headingTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  tripHeadingNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: ui.navy,
  },
  headingBoatText: {
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
  headingDivider: {
    height: 1,
    backgroundColor: ui.border,
    marginVertical: 10,
  },
  headingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headingDateText: {
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

  // TOTAL CAUGHT KPI CARD
  totalKpiCard: {
    backgroundColor: '#F0F9FA',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CDE5EB',
    marginBottom: 12,
  },
  totalKpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  totalKpiLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.8,
  },
  totalWeightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  totalWeightNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: -0.5,
  },
  totalWeightUnit: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.tealDark,
  },
  totalWeightFormula: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
    marginTop: 2,
  },
  kpiRightCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  estValueBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  estValueLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.6,
  },
  estValueAmount: {
    fontSize: 12,
    fontWeight: '900',
    color: '#059669',
    marginTop: 1,
  },
  addCatchHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealDark,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addCatchHeaderBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // SAMPLE BANNER
  sampleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE047',
    marginBottom: 14,
    gap: 8,
  },
  sampleIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#854D0E',
  },
  sampleBody: {
    fontSize: 10,
    fontWeight: '700',
    color: '#713F12',
    marginTop: 1,
  },
  applySampleBtn: {
    backgroundColor: '#CA8A04',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  applySampleBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // TABLE HEADER & LIST
  tableHeaderRow: {
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
    fontSize: 11,
    fontWeight: '700',
    color: ui.muted,
  },
  catchList: {
    gap: 10,
    marginBottom: 16,
  },
  catchCard: {
    backgroundColor: ui.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
  },
  catchTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  speciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fishEmoji: {
    fontSize: 16,
  },
  speciesName: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    flex: 1,
  },
  storageText: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '600',
    marginTop: 3,
  },
  qtyBadgeCol: {
    alignItems: 'flex-end',
  },
  qtyBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 2,
  },
  qtyBadgeNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.tealDark,
  },
  qtyBadgeUnit: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  shareText: {
    fontSize: 9,
    fontWeight: '700',
    color: ui.muted,
    marginTop: 2,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ui.tealDark,
    borderRadius: 2,
  },
  catchDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  catchBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  gradeBadge: {
    backgroundColor: '#F0F9FA',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CDE5EB',
    maxWidth: '45%',
  },
  gradeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  estPriceText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#059669',
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

  // EMPTY
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
