import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { EmptyStateCard, SectionHeader, money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { FishingTrip } from '@/types';

export default function FishermanTripsScreen() {
  const { trips, addTrip } = useFisherman();

  const totalCatch = trips
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.catchVolumeKg, 0);

  const handleLogNewTrip = () => {
    Alert.alert(
      'Log Sea Voyage',
      'Choose how you want to log your sea voyage:',
      [
        {
          text: 'Open Full Form (S12)',
          onPress: () => router.push('/fisherman/s12'),
        },
        {
          text: 'Quick Start (TR-110)',
          onPress: () => {
            const newTrip: FishingTrip = {
              id: `trip-${Date.now()}`,
              tripNumber: `TR-${110 + trips.length}`,
              boatName: 'Sagara Rani II',
              harbor: 'Negombo Offshore (South Trench)',
              departureDate: 'Just now',
              returnDate: 'Scheduled 6 hrs from now',
              catchVolumeKg: 0,
              fuelCost: 12000,
              iceBaitCost: 5000,
              otherCost: 2000,
              status: 'ongoing',
            };
            addTrip(newTrip);
            Alert.alert('Sea Trip Started', 'Trip TR-110 is active. Safe sailing!');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  return (
    <FishermanShell
      title="Sea Voyages & Trips"
      subtitle="Boat log, fuel logs & catch yields"
      rightIcon="clock"
      rightLabel="Log trip"
      onRightPress={handleLogNewTrip}
    >
      <View style={styles.kpiCard}>
        <View style={styles.kpiRow}>
          <View>
            <Text style={styles.kpiEyebrow}>SEASON CATCH VOLUME</Text>
            <Text style={styles.kpiMain}>{totalCatch.toFixed(1)} KG Landed</Text>
            <Text style={styles.kpiSub}>Across {trips.length} tracked voyages</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={handleLogNewTrip}
            style={styles.newTripBtn}
          >
            <FishermanIcon name="plus" size={15} color="#FFFFFF" />
            <Text style={styles.newTripBtnText}>+ Log Trip</Text>
          </Pressable>
        </View>
      </View>

      <SectionHeader
        title="Voyage Records"
        subtitle="Recent boat departures from Negombo harbor"
        count={trips.length}
      />

      {trips.length === 0 ? (
        <EmptyStateCard
          icon="clock"
          title="No sea voyages logged yet"
          description="Track boat departures, nautical zones, diesel fuel litrage and catch yield to calculate exact net profits."
          actionText="+ Log New Voyage (S12)"
          onAction={handleLogNewTrip}
        />
      ) : (
        trips.map((trip) => {
          const isCompleted = trip.status === 'completed';
          const isOngoing = trip.status === 'ongoing';
          return (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripTopRow}>
                <View style={styles.tripBadge}>
                  <Text style={styles.tripNumber}>{trip.tripNumber}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={styles.boatTitle}>
                    {trip.boatName} · {trip.harbor}
                  </Text>
                  <Text numberOfLines={1} style={styles.tripDate}>
                    {trip.departureDate} → {trip.returnDate}
                  </Text>
                </View>
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
                    {isCompleted ? 'Completed' : isOngoing ? 'At Sea ●' : 'Planned'}
                  </Text>
                </View>
              </View>

              <View style={styles.tripStatsRow}>
                <View style={styles.tripStatItem}>
                  <Text style={styles.tripStatLabel}>Catch Haul</Text>
                  <Text style={styles.tripStatValue}>
                    {trip.catchVolumeKg > 0 ? `${trip.catchVolumeKg} KG` : 'In progress'}
                  </Text>
                </View>
                <View style={styles.tripStatItem}>
                  <Text style={styles.tripStatLabel}>Fuel Cost</Text>
                  <Text style={styles.tripStatValue}>{money(trip.fuelCost)}</Text>
                </View>
                <View style={styles.tripStatItem}>
                  <Text style={styles.tripStatLabel}>Ice & Bait</Text>
                  <Text style={styles.tripStatValue}>{money(trip.iceBaitCost)}</Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  kpiCard: {
    backgroundColor: ui.surface,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: ui.border,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 3,
  },
  kpiSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 3,
  },
  newTripBtn: {
    backgroundColor: ui.teal,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  newTripBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tripCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 12,
  },
  tripTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tripBadge: {
    backgroundColor: ui.softBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tripNumber: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.navy,
  },
  boatTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  tripDate: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 2,
  },
  tripStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusCompleted: {
    backgroundColor: ui.successSoft,
  },
  statusOngoing: {
    backgroundColor: ui.tealLight,
  },
  statusPlanned: {
    backgroundColor: ui.softBlue,
  },
  tripStatusText: {
    fontSize: 10,
    fontWeight: '900',
  },
  statusTextCompleted: {
    color: ui.success,
  },
  statusTextOngoing: {
    color: ui.tealDark,
  },
  statusTextPlanned: {
    color: ui.navy,
  },
  tripStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: ui.borderSubtle,
  },
  tripStatItem: {
    gap: 2,
  },
  tripStatLabel: {
    fontSize: 9,
    color: ui.muted,
    fontWeight: '700',
  },
  tripStatValue: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
});
