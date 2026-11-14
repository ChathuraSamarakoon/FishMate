import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

const FISHING_ZONES = [
  { id: 'z1', name: 'Negombo Deep Basin (18 nm)', target: 'Yellowfin Tuna & Skipjack', depth: '240m' },
  { id: 'z2', name: 'Western Shelf Ridge (12 nm)', target: 'Red Snapper & Seer Fish', depth: '85m' },
  { id: 'z3', name: 'Chilaw Deep Trench (26 nm)', target: 'Sailfish & Pelagics', depth: '420m' },
  { id: 'z4', name: 'Coastal Mud Flats (6 nm)', target: 'Jumbo Prawns & Crab', depth: '35m' },
];

export default function S12NewTripScreen() {
  const { addTrip, profile } = useFisherman();
  const [selectedZone, setSelectedZone] = useState(FISHING_ZONES[0]);
  const [crewCount, setCrewCount] = useState('4');
  const [fuelLitres] = useState('45');
  const [fuelCost, setFuelCost] = useState('14500');
  const [iceCost, setIceCost] = useState('6500');
  const [baitCost, setBaitCost] = useState('3200');
  const [harborFee, setHarborFee] = useState('1800');
  const [expectedHours, setExpectedHours] = useState('7');

  const totalExpense =
    (parseFloat(fuelCost) || 0) +
    (parseFloat(iceCost) || 0) +
    (parseFloat(baitCost) || 0) +
    (parseFloat(harborFee) || 0);

  const handleStartTrip = () => {
    addTrip({
      id: `trip-${Date.now()}`,
      tripNumber: `TR-${110 + Math.floor(Math.random() * 20)}`,
      boatName: profile.boatName ?? 'Sagara Rani II',
      harbor: selectedZone.name,
      departureDate: 'Just now',
      returnDate: `In ~${expectedHours} hrs`,
      catchVolumeKg: 0,
      fuelCost: parseFloat(fuelCost) || 0,
      iceBaitCost: (parseFloat(iceCost) || 0) + (parseFloat(baitCost) || 0),
      otherCost: parseFloat(harborFee) || 0,
      status: 'ongoing',
    });

    Alert.alert(
      'Sea Voyage Logged! (S12)',
      `Voyage on ${profile.boatName ?? 'Sagara Rani II'} recorded to ${selectedZone.name}.\n\nTotal estimated trip expense: ${money(totalExpense)}.\nTarget duration: ~${expectedHours} hours.\n\nDashboard trips count and live activity have been updated!`,
      [
        {
          text: 'View Sea Trips',
          onPress: () => router.replace('/fisherman/trips'),
        },
        {
          text: 'Back to Dashboard',
          onPress: () => router.replace('/fisherman/dashboard'),
        },
      ],
    );
  };

  return (
    <FishermanShell
      title="S12 · Log New Sea Trip"
      subtitle="Boat voyage, zone & voyage expenses"
      back
      rightIcon="clock"
      rightLabel="Save trip"
      onRightPress={handleStartTrip}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S12</Text>
        </View>
        <Text style={styles.helperText}>Sea voyage logger & cost tracker</Text>
      </View>

      {/* VESSEL INFO BANNER */}
      <View style={styles.vesselCard}>
        <View style={styles.vesselIconWrap}>
          <FishermanIcon name="boat" size={24} color={ui.tealDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.vesselName}>{profile.boatName ?? 'Sagara Rani II'}</Text>
          <Text style={styles.vesselSub}>
            Registration: {profile.registrationNumber ?? 'CFV-A-4198-NEG'} · {profile.village}
          </Text>
        </View>
        <View style={styles.vesselStatusPill}>
          <Text style={styles.vesselStatusText}>● Inspected</Text>
        </View>
      </View>

      {/* ZONE SELECTION */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeading}>1. Destination & Waypoint Zone</Text>
        <Text style={styles.cardSub}>Select nautical waypoint for this fishing expedition</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.zoneScroll}
        >
          {FISHING_ZONES.map((zone) => {
            const active = selectedZone.id === zone.id;
            return (
              <Pressable
                key={zone.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setSelectedZone(zone)}
                style={[styles.zoneCard, active && styles.zoneCardActive]}
              >
                <View style={styles.zoneTop}>
                  <Text style={[styles.zoneName, active && styles.zoneNameActive]}>
                    {zone.name}
                  </Text>
                  <View style={[styles.depthBadge, active && styles.depthBadgeActive]}>
                    <Text style={[styles.depthText, active && styles.depthTextActive]}>
                      {zone.depth}
                    </Text>
                  </View>
                </View>
                <Text style={styles.zoneTarget}>Target: {zone.target}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* CREW & DURATION */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeading}>2. Crew & Departure Plan</Text>
        <Text style={styles.cardSub}>Specify crew on board and expected expedition duration</Text>

        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Crew Members on Board</Text>
            <View style={styles.inputBox}>
              <FishermanIcon name="user" size={15} color={ui.muted} />
              <TextInput
                value={crewCount}
                onChangeText={setCrewCount}
                keyboardType="numeric"
                style={styles.inputField}
              />
              <Text style={styles.inputUnit}>Crew</Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Est. Voyage Duration</Text>
            <View style={styles.inputBox}>
              <FishermanIcon name="clock" size={15} color={ui.muted} />
              <TextInput
                value={expectedHours}
                onChangeText={setExpectedHours}
                keyboardType="numeric"
                style={styles.inputField}
              />
              <Text style={styles.inputUnit}>Hours</Text>
            </View>
          </View>
        </View>
      </View>

      {/* VOYAGE EXPENSES */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeading}>3. Voyage Operational Expenses</Text>
        <Text style={styles.cardSub}>Track fuel, ice, bait and dock fees for accurate net profit</Text>

        <View style={styles.expenseInputsGrid}>
          <View style={styles.expenseCol}>
            <Text style={styles.inputLabel}>Diesel Fuel (LKR)</Text>
            <View style={styles.inputBox}>
              <Text style={styles.currency}>Rs.</Text>
              <TextInput
                value={fuelCost}
                onChangeText={setFuelCost}
                keyboardType="numeric"
                style={styles.inputField}
              />
            </View>
            <Text style={styles.smallHint}>{fuelLitres} Litres diesel</Text>
          </View>

          <View style={styles.expenseCol}>
            <Text style={styles.inputLabel}>Ice Blocks (LKR)</Text>
            <View style={styles.inputBox}>
              <Text style={styles.currency}>Rs.</Text>
              <TextInput
                value={iceCost}
                onChangeText={setIceCost}
                keyboardType="numeric"
                style={styles.inputField}
              />
            </View>
            <Text style={styles.smallHint}>Crushed ice crates</Text>
          </View>
        </View>

        <View style={[styles.expenseInputsGrid, { marginTop: 10 }]}>
          <View style={styles.expenseCol}>
            <Text style={styles.inputLabel}>Live / Frozen Bait (LKR)</Text>
            <View style={styles.inputBox}>
              <Text style={styles.currency}>Rs.</Text>
              <TextInput
                value={baitCost}
                onChangeText={setBaitCost}
                keyboardType="numeric"
                style={styles.inputField}
              />
            </View>
          </View>

          <View style={styles.expenseCol}>
            <Text style={styles.inputLabel}>Harbor Docking (LKR)</Text>
            <View style={styles.inputBox}>
              <Text style={styles.currency}>Rs.</Text>
              <TextInput
                value={harborFee}
                onChangeText={setHarborFee}
                keyboardType="numeric"
                style={styles.inputField}
              />
            </View>
          </View>
        </View>

        {/* TOTAL EXPENSE SUM */}
        <View style={styles.totalExpenseBox}>
          <View>
            <Text style={styles.totalExpLabel}>Total Estimated Voyage Cost:</Text>
            <Text style={styles.totalExpSub}>Will be factored into S21 Profit calculations</Text>
          </View>
          <Text style={styles.totalExpAmount}>{money(totalExpense)}</Text>
        </View>
      </View>

      {/* SUBMIT BUTTON */}
      <Pressable
        accessibilityRole="button"
        onPress={handleStartTrip}
        style={styles.startBtn}
      >
        <FishermanIcon name="boat" size={18} color="#FFFFFF" />
        <Text style={styles.startBtnText}>Start Sea Voyage Log (S12)</Text>
      </Pressable>
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
  },
  vesselCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  vesselIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vesselName: {
    fontSize: 15,
    fontWeight: '900',
    color: ui.navy,
  },
  vesselSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  vesselStatusPill: {
    backgroundColor: ui.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vesselStatusText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.success,
  },
  sectionCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 14,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
  },
  cardSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
    marginBottom: 12,
  },
  zoneScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  zoneCard: {
    width: 210,
    backgroundColor: ui.bg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: ui.border,
  },
  zoneCardActive: {
    backgroundColor: ui.tealLight,
    borderColor: ui.teal,
  },
  zoneTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  zoneName: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
    flex: 1,
  },
  zoneNameActive: {
    color: ui.tealDark,
    fontWeight: '900',
  },
  depthBadge: {
    backgroundColor: ui.softBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  depthBadgeActive: {
    backgroundColor: ui.teal,
  },
  depthText: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.navy,
  },
  depthTextActive: {
    color: '#FFFFFF',
  },
  zoneTarget: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ui.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 12,
    height: 44,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: ui.navy,
    marginHorizontal: 6,
  },
  inputUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.muted,
  },
  currency: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.muted,
  },
  expenseInputsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  expenseCol: {
    flex: 1,
  },
  smallHint: {
    fontSize: 9,
    color: ui.muted,
    marginTop: 3,
  },
  totalExpenseBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: ui.warningSoft,
    padding: 14,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#F8E0B7',
  },
  totalExpLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.warning,
  },
  totalExpSub: {
    fontSize: 9,
    color: ui.muted,
    marginTop: 2,
  },
  totalExpAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
  },
  startBtn: {
    backgroundColor: ui.teal,
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    shadowColor: ui.teal,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
