import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

export default function S15CatchRecordsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { trips } = useFisherman();

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

  const catches = trip.catches ?? [];
  const totalWeight = catches.reduce((sum, c) => sum + c.weightKg, 0) || trip.catchVolumeKg || 0;
  const totalValue = catches.reduce((sum, c) => sum + (c.estimatedValue || 0), 0);

  const handleExportCatchSheet = () => {
    Alert.alert(
      'Export Catch Sheet (S15)',
      `Official harbor catch tally sheet generated for ${trip.tripNumber}.\n\nTotal Landed: ${totalWeight.toFixed(1)} kg across ${catches.length} batches.\n\nExported to documents.`,
      [{ text: 'OK' }],
    );
  };

  return (
    <FishermanShell
      title={`S15 · ${trip.tripNumber} Catches`}
      subtitle="Complete landed haul records & grading"
      back
      onBack={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
      rightIcon="sparkles"
      rightLabel="Tally"
      onRightPress={handleExportCatchSheet}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S15</Text>
        </View>
        <Text numberOfLines={1} style={styles.helperText}>
          Species haul records, storage bins & sashimi grading
        </Text>
      </View>

      {/* SUMMARY BANNER */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>TOTAL LANDED WEIGHT</Text>
            <Text style={styles.summaryValue}>{totalWeight.toFixed(1)} KG</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.summaryLabel}>ESTIMATED VALUE</Text>
            <Text style={styles.summaryValueTeal}>{money(totalValue)}</Text>
          </View>
        </View>
        <Text style={styles.summaryVessel}>
          Vessel: {trip.boatName} · {catches.length} Catch Batches Logged
        </Text>
      </View>

      {/* ACTION BAR */}
      <View style={styles.actionBar}>
        <Text style={styles.sectionTitle}>Recorded Batches ({catches.length})</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/fisherman/s16' as never, params: { tripId: trip.id } })}
          style={styles.addCatchBtn}
        >
          <FishermanIcon name="plus" size={13} color="#FFFFFF" />
          <Text style={styles.addCatchBtnText}>+ Add Catch (S16)</Text>
        </Pressable>
      </View>

      {/* CATCH RECORDS LIST */}
      {catches.length === 0 ? (
        <View style={styles.card}>
          <FishermanIcon name="boat" size={32} color={ui.muted} />
          <Text style={styles.emptyTitle}>No Catch Batches Logged</Text>
          <Text style={styles.emptySub}>
            Record harvested tuna, snapper, mackerel with weight and storage bins.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/fisherman/s16' as never, params: { tripId: trip.id } })}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>+ Log First Catch (S16)</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.catchList}>
          {catches.map((c, index) => (
            <View key={c.id || index} style={styles.catchCard}>
              <View style={styles.catchHeaderRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={styles.speciesName}>
                    {c.species}
                  </Text>
                  <Text numberOfLines={1} style={styles.storageText}>
                    📦 {c.storageMethod ?? 'Crushed ice slurry bin'}
                  </Text>
                </View>
                <View style={styles.weightPill}>
                  <Text style={styles.weightPillText}>{c.weightKg.toFixed(1)} kg</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.catchFooterRow}>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeBadgeText}>{c.grade ?? 'Grade A'}</Text>
                </View>
                <Text style={styles.timeText}>🕒 {c.recordedAt}</Text>
                {c.estimatedValue ? (
                  <Text style={styles.valueText}>{money(c.estimatedValue)}</Text>
                ) : null}
              </View>
            </View>
          ))}
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
    backgroundColor: '#F0F9FA',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CDE5EB',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  summaryValueTeal: {
    fontSize: 20,
    fontWeight: '900',
    color: ui.tealDark,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#CDE5EB',
    marginHorizontal: 12,
  },
  summaryVessel: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.muted,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DEEFF3',
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
  addCatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealDark,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addCatchBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
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
  catchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  speciesName: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  storageText: {
    fontSize: 11,
    color: ui.muted,
    fontWeight: '600',
    marginTop: 3,
  },
  weightPill: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weightPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.tealDark,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  catchFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gradeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gradeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  timeText: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
  },
  valueText: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
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
