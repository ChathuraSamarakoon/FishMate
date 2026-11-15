import { useState } from 'react';
import {
  Alert,
  Modal,
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
import type { FishingTrip } from '@/types';

const FISHING_ZONES = [
  { id: 'z1', name: 'Negombo Deep Basin (18 nm)', target: 'Yellowfin Tuna & Skipjack', depth: '240m' },
  { id: 'z2', name: 'Western Shelf Ridge (12 nm)', target: 'Red Snapper & Seer Fish', depth: '85m' },
  { id: 'z3', name: 'Chilaw Deep Trench (26 nm)', target: 'Sailfish & Pelagics', depth: '420m' },
  { id: 'z4', name: 'Coastal Mud Flats (6 nm)', target: 'Jumbo Prawns & Crab', depth: '35m' },
];

const DATE_PRESETS = [
  { label: 'Today (15 Nov)', value: 'Today, 15 Nov 2026' },
  { label: 'Tomorrow (16 Nov)', value: 'Tomorrow, 16 Nov 2026' },
  { label: 'Yesterday (14 Nov)', value: 'Yesterday, 14 Nov 2026' },
];

const DEPARTURE_PRESETS = [
  '03:30 AM (Dawn)',
  '04:30 AM',
  '05:30 AM',
  '06:00 PM (Dusk)',
];

const RETURN_PRESETS_DAY = [
  '09:30 AM',
  '11:00 AM',
  '01:30 PM',
  '04:00 PM',
];

const RETURN_PRESETS_OVERNIGHT = [
  '05:30 AM (+1 Day)',
  '07:00 AM (+1 Day)',
  '09:00 AM (+1 Day)',
  '12:00 PM (+1 Day)',
];

export default function S12NewTripScreen() {
  const { addTrip, profile, trips } = useFisherman();

  // 01. TRIP DATE & TIME STATES
  const [tripDate, setTripDate] = useState('Today, 15 Nov 2026');
  const [departureTime, setDepartureTime] = useState('03:30 AM');
  const [returnTime, setReturnTime] = useState('10:30 AM');
  const [isOvernight, setIsOvernight] = useState(false);

  // 01. FISHING LOCATION & BOAT DETAILS
  const [fishingLocation, setFishingLocation] = useState(FISHING_ZONES[0].name);
  const [boatName, setBoatName] = useState(profile.boatName ?? 'Sagara Rani II');
  const [boatRegNumber, setBoatRegNumber] = useState(profile.registrationNumber ?? 'CFV-A-4198-NEG');
  const [boatMooring, setBoatMooring] = useState(profile.harborMooring ?? 'Berth A-07, Pier Gate 02');

  // CREW & EXPENSES
  const [crewCount, setCrewCount] = useState('4');
  const [fuelCost, setFuelCost] = useState('14500');
  const [iceCost, setIceCost] = useState('6500');
  const [baitCost, setBaitCost] = useState('3200');
  const [harborFee] = useState('1800');

  // 03. VALIDATION ERROR STATES
  const [dateError, setDateError] = useState('');
  const [depTimeError, setDepTimeError] = useState('');
  const [retTimeError, setRetTimeError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [boatError, setBoatError] = useState('');

  // Custom date picker modal
  const [customDateModalVisible, setCustomDateModalVisible] = useState(false);
  const [customDateInput, setCustomDateInput] = useState('17 Nov 2026');

  const totalExpense =
    (parseFloat(fuelCost) || 0) +
    (parseFloat(iceCost) || 0) +
    (parseFloat(baitCost) || 0) +
    (parseFloat(harborFee) || 0);

  // 03. REQUIRED TRIP DATA VALIDATION
  const validateForm = (): boolean => {
    let valid = true;

    if (!tripDate.trim()) {
      setDateError('Trip Date is required.');
      valid = false;
    } else {
      setDateError('');
    }

    if (!departureTime.trim()) {
      setDepTimeError('Departure Time is required.');
      valid = false;
    } else {
      setDepTimeError('');
    }

    if (!returnTime.trim()) {
      setRetTimeError('Return Time is required.');
      valid = false;
    } else {
      setRetTimeError('');
    }

    if (!fishingLocation.trim()) {
      setLocationError('Fishing Location / Zone is required.');
      valid = false;
    } else {
      setLocationError('');
    }

    if (!boatName.trim() || !boatRegNumber.trim()) {
      setBoatError('Boat Vessel Name & Registration Number are required.');
      valid = false;
    } else {
      setBoatError('');
    }

    return valid;
  };

  // 02. SAVE TRIP -> S13 TRIP DETAILS
  const handleSaveTrip = () => {
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please complete all required fields (Date, Times, Location and Boat details) before saving.',
      );
      return;
    }

    const nextTripNumber = `TR-${110 + trips.length}`;
    const newTripId = `trip-${Date.now()}`;

    const newTrip: FishingTrip = {
      id: newTripId,
      tripNumber: nextTripNumber,
      boatName: boatName.trim(),
      harbor: fishingLocation.trim(),
      departureDate: `${tripDate.split(',')[0]} ${departureTime}`,
      returnDate: isOvernight ? `${returnTime} (Overnight)` : `${returnTime}`,
      catchVolumeKg: 0,
      fuelCost: parseFloat(fuelCost) || 0,
      iceBaitCost: (parseFloat(iceCost) || 0) + (parseFloat(baitCost) || 0),
      otherCost: parseFloat(harborFee) || 0,
      status: 'ongoing',
      revenue: 0,
      profit: -totalExpense,
      nauticalMiles: 18,
      targetSpecies: ['Yellowfin Tuna', 'Pelagic Catch'],
      crewCount: parseInt(crewCount, 10) || 4,
      isOvernight,
      tripDate: tripDate.trim(),
    };

    addTrip(newTrip);

    Alert.alert(
      'Sea Voyage Saved! (S12)',
      `Trip ${nextTripNumber} on ${boatName} to ${fishingLocation} has been logged.\n\nDeparture: ${departureTime} · Return: ${returnTime}${isOvernight ? ' (Overnight)' : ''}.\nTotal estimated expense: ${money(totalExpense)}.\n\nNow opening Trip Details (S13)...`,
      [
        {
          text: 'View Trip Details (S13)',
          onPress: () =>
            router.replace({
              pathname: '/fisherman/s13',
              params: { id: newTripId },
            } as never),
        },
      ],
    );
  };

  // 02. CANCEL -> S11
  const handleCancel = () => {
    router.replace('/fisherman/trips');
  };

  return (
    <FishermanShell
      title="S12 · Log Sea Trip"
      subtitle="Boat voyage timing, zone & vessel details"
      back
      onBack={handleCancel}
      rightIcon="check"
      rightLabel="Save Trip"
      onRightPress={handleSaveTrip}
    >
      {/* SCREEN BREADCRUMB */}
      <View style={styles.breadcrumbRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S12</Text>
        </View>
        <Text numberOfLines={1} style={styles.breadcrumbText}>
          Record sea departure, arrival timing & boat details
        </Text>
      </View>

      {/* 01. BOAT DETAILS FIELD */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.boatIconWrap}>
            <FishermanIcon name="boat" size={20} color={ui.tealDark} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.cardHeading}>01 · Boat Vessel Details</Text>
            <Text style={styles.cardSub}>
              Fishing vessel registration & harbor mooring berth
            </Text>
          </View>
        </View>

        {/* BOAT NAME */}
        <Text style={styles.inputLabel}>
          Boat Vessel Name <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          value={boatName}
          onChangeText={(val) => {
            setBoatName(val);
            if (val.trim()) setBoatError('');
          }}
          placeholder="e.g. Sagara Rani II"
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, boatError ? styles.inputError : null]}
        />

        {/* REGISTRATION & MOORING */}
        <View style={styles.twoColRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>
              Harbor Reg # <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              value={boatRegNumber}
              onChangeText={(val) => {
                setBoatRegNumber(val);
                if (val.trim()) setBoatError('');
              }}
              placeholder="CFV-A-4198-NEG"
              placeholderTextColor={ui.mutedLight}
              style={[styles.input, boatError ? styles.inputError : null]}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Mooring Berth</Text>
            <TextInput
              value={boatMooring}
              onChangeText={setBoatMooring}
              placeholder="Berth A-07"
              placeholderTextColor={ui.mutedLight}
              style={styles.input}
            />
          </View>
        </View>
        {boatError ? <Text style={styles.errorText}>{boatError}</Text> : null}
      </View>

      {/* 01. TRIP DATE PICKER */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>
          02 · Trip Date Picker <Text style={styles.requiredStar}>*</Text>
        </Text>
        <Text style={styles.cardSub}>Scheduled boat departure date</Text>

        {/* SELECTED DATE DISPLAY */}
        <View style={styles.displayPill}>
          <FishermanIcon name="clock" size={16} color={ui.tealDark} />
          <Text style={styles.displayPillText}>{tripDate}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setCustomDateModalVisible(true)}
            style={styles.customDateBtn}
          >
            <Text style={styles.customDateBtnText}>Custom Date ✎</Text>
          </Pressable>
        </View>
        {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

        {/* DATE PRESETS */}
        <Text style={styles.subInputLabel}>Quick Date Presets:</Text>
        <View style={styles.chipsWrap}>
          {DATE_PRESETS.map((p) => {
            const isMatch = tripDate === p.value;
            return (
              <Pressable
                key={p.label}
                accessibilityRole="button"
                onPress={() => {
                  setTripDate(p.value);
                  setDateError('');
                }}
                style={[styles.presetChip, isMatch && styles.presetChipActive]}
              >
                <Text
                  style={[styles.presetChipText, isMatch && styles.presetChipTextActive]}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 01. DEPARTURE & RETURN TIME PICKERS + OVERNIGHT TOGGLE */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>03 · Departure & Return Times</Text>
        <Text style={styles.cardSub}>Nautical departure hour & expected harbor return</Text>

        {/* 03. OVERNIGHT SEA VOYAGE TOGGLE (OVERNIGHT TRIPS POSSIBLE) */}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isOvernight }}
          onPress={() => {
            const next = !isOvernight;
            setIsOvernight(next);
            if (next && !returnTime.includes('+1 Day')) {
              setReturnTime('06:00 AM (+1 Day)');
            } else if (!next && returnTime.includes('+1 Day')) {
              setReturnTime('10:30 AM');
            }
          }}
          style={[styles.overnightToggleCard, isOvernight && styles.overnightToggleCardActive]}
        >
          <View style={styles.overnightLeft}>
            <Text style={styles.overnightEmoji}>🌙</Text>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.overnightTitle}>Overnight Sea Voyage (Returns Next Day)</Text>
              <Text style={styles.overnightSub}>
                Enable for deep-sea night fishing, dusk departures, or multi-watch trips.
              </Text>
            </View>
          </View>
          <View style={[styles.toggleCheckbox, isOvernight && styles.toggleCheckboxActive]}>
            {isOvernight ? (
              <FishermanIcon name="check" size={14} color="#FFFFFF" />
            ) : null}
          </View>
        </Pressable>

        {/* DEPARTURE TIME */}
        <Text style={[styles.inputLabel, { marginTop: 14 }]}>
          Departure Time <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          value={departureTime}
          onChangeText={(val) => {
            setDepartureTime(val);
            if (val.trim()) setDepTimeError('');
          }}
          placeholder="03:30 AM"
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, depTimeError ? styles.inputError : null]}
        />
        {depTimeError ? <Text style={styles.errorText}>{depTimeError}</Text> : null}

        {/* DEPARTURE PRESETS */}
        <View style={styles.chipsWrap}>
          {DEPARTURE_PRESETS.map((t) => (
            <Pressable
              key={t}
              accessibilityRole="button"
              onPress={() => {
                setDepartureTime(t.split(' ')[0] + ' ' + t.split(' ')[1]);
                setDepTimeError('');
              }}
              style={styles.timeChip}
            >
              <Text style={styles.timeChipText}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {/* RETURN TIME */}
        <Text style={[styles.inputLabel, { marginTop: 14 }]}>
          Expected Return Time <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          value={returnTime}
          onChangeText={(val) => {
            setReturnTime(val);
            if (val.trim()) setRetTimeError('');
          }}
          placeholder="10:30 AM"
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, retTimeError ? styles.inputError : null]}
        />
        {retTimeError ? <Text style={styles.errorText}>{retTimeError}</Text> : null}

        {/* RETURN PRESETS */}
        <View style={styles.chipsWrap}>
          {(isOvernight ? RETURN_PRESETS_OVERNIGHT : RETURN_PRESETS_DAY).map((t) => (
            <Pressable
              key={t}
              accessibilityRole="button"
              onPress={() => {
                setReturnTime(t);
                setRetTimeError('');
              }}
              style={styles.timeChip}
            >
              <Text style={styles.timeChipText}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 01. FISHING LOCATION FIELD */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>
          04 · Fishing Location & Nautical Waypoints <Text style={styles.requiredStar}>*</Text>
        </Text>
        <Text style={styles.cardSub}>Destination sea zone and fishing coordinates</Text>

        <TextInput
          value={fishingLocation}
          onChangeText={(val) => {
            setFishingLocation(val);
            if (val.trim()) setLocationError('');
          }}
          placeholder="e.g. Negombo Deep Basin (18 nm)"
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, locationError ? styles.inputError : null]}
        />
        {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}

        {/* QUICK ZONE PRESETS */}
        <Text style={styles.subInputLabel}>Select from Sri Lanka Coastal Waypoints:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.zoneScroll}
        >
          {FISHING_ZONES.map((zone) => {
            const isMatch = fishingLocation === zone.name;
            return (
              <Pressable
                key={zone.id}
                accessibilityRole="button"
                onPress={() => {
                  setFishingLocation(zone.name);
                  setLocationError('');
                }}
                style={[styles.zoneCard, isMatch && styles.zoneCardActive]}
              >
                <View style={styles.zoneTop}>
                  <Text style={[styles.zoneName, isMatch && styles.zoneNameActive]}>
                    {zone.name}
                  </Text>
                  <View style={[styles.depthBadge, isMatch && styles.depthBadgeActive]}>
                    <Text style={[styles.depthText, isMatch && styles.depthTextActive]}>
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

      {/* VOYAGE EXPENSES ESTIMATION */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>05 · Crew & Voyage Operational Expenses</Text>
        <Text style={styles.cardSub}>Track fuel, ice, bait and crew count for net profit</Text>

        <View style={styles.twoColRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Crew Count</Text>
            <TextInput
              value={crewCount}
              onChangeText={setCrewCount}
              keyboardType="numeric"
              placeholder="4"
              placeholderTextColor={ui.mutedLight}
              style={styles.input}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Diesel Fuel (Rs.)</Text>
            <TextInput
              value={fuelCost}
              onChangeText={setFuelCost}
              keyboardType="numeric"
              placeholder="14500"
              placeholderTextColor={ui.mutedLight}
              style={styles.input}
            />
          </View>
        </View>

        <View style={[styles.twoColRow, { marginTop: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Ice Crushed (Rs.)</Text>
            <TextInput
              value={iceCost}
              onChangeText={setIceCost}
              keyboardType="numeric"
              placeholder="6500"
              placeholderTextColor={ui.mutedLight}
              style={styles.input}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Bait & Dock Fee (Rs.)</Text>
            <TextInput
              value={baitCost}
              onChangeText={setBaitCost}
              keyboardType="numeric"
              placeholder="5000"
              placeholderTextColor={ui.mutedLight}
              style={styles.input}
            />
          </View>
        </View>

        {/* TOTAL ESTIMATED EXPENSE PREVIEW */}
        <View style={styles.totalExpenseBanner}>
          <View>
            <Text style={styles.totalExpLabel}>ESTIMATED EXPENSES</Text>
            <Text style={styles.totalExpSub}>Pre-calculated for S13 Voyage Statement</Text>
          </View>
          <Text style={styles.totalExpValue}>{money(totalExpense)}</Text>
        </View>
      </View>

      {/* 02. BUTTONS & NAVIGATION / ACTIONS BAR */}
      <View style={styles.actionsBar}>
        {/* SAVE TRIP -> S13 TRIP DETAILS */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save Sea Voyage and view details"
          onPress={handleSaveTrip}
          style={styles.saveTripBtn}
        >
          <FishermanIcon name="boat" size={18} color="#FFFFFF" />
          <Text style={styles.saveTripBtnText}>Save Trip → S13 Trip Details</Text>
        </Pressable>

        {/* CANCEL -> S11 */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel and return to Fishing Trips"
          onPress={handleCancel}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Cancel and Return to Trips (S11)</Text>
        </Pressable>
      </View>

      {/* CUSTOM DATE PICKER MODAL */}
      <Modal
        visible={customDateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomDateModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Custom Trip Date</Text>
            <Text style={styles.modalSub}>Enter departure date for scheduled sea voyage</Text>

            <TextInput
              value={customDateInput}
              onChangeText={setCustomDateInput}
              placeholder="e.g. 17 Nov 2026"
              placeholderTextColor={ui.mutedLight}
              style={styles.modalInput}
            />

            <View style={styles.modalBtnRow}>
              <Pressable
                onPress={() => setCustomDateModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (customDateInput.trim()) {
                    setTripDate(customDateInput.trim());
                    setDateError('');
                  }
                  setCustomDateModalVisible(false);
                }}
                style={styles.modalSaveBtn}
              >
                <Text style={styles.modalSaveText}>Apply Date</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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

  // CARD STYLES
  card: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  boatIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  cardSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    marginBottom: 6,
  },
  subInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 6,
  },
  requiredStar: {
    color: ui.danger,
    fontWeight: '900',
  },
  input: {
    backgroundColor: '#F8FCFD',
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13,
    color: ui.navy,
    fontWeight: '600',
  },
  inputError: {
    borderColor: ui.danger,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: ui.danger,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    marginLeft: 2,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  // DISPLAY PILL
  displayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FA',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4EEF2',
  },
  displayPillText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  customDateBtn: {
    backgroundColor: ui.surface,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ui.tealDark,
  },
  customDateBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },

  // PRESETS & CHIPS
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  presetChip: {
    backgroundColor: '#F0F9FA',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4EEF2',
  },
  presetChipActive: {
    backgroundColor: ui.tealLight,
    borderColor: ui.tealDark,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  presetChipTextActive: {
    color: ui.tealDark,
  },
  timeChip: {
    backgroundColor: '#F8FCFD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ui.border,
  },
  timeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
  },

  // OVERNIGHT TOGGLE
  overnightToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FCFD',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: ui.border,
    marginTop: 8,
    gap: 10,
  },
  overnightToggleCardActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#8B5CF6',
  },
  overnightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  overnightEmoji: {
    fontSize: 20,
  },
  overnightTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  overnightSub: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 1,
  },
  toggleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: ui.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  toggleCheckboxActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },

  // ZONE CARDS
  zoneScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  zoneCard: {
    width: 220,
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: ui.border,
  },
  zoneCardActive: {
    backgroundColor: '#EBF7F9',
    borderColor: ui.tealDark,
  },
  zoneTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  zoneName: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
    flex: 1,
  },
  zoneNameActive: {
    color: ui.tealDark,
  },
  depthBadge: {
    backgroundColor: '#EBF4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  depthBadgeActive: {
    backgroundColor: ui.tealLight,
  },
  depthText: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.muted,
  },
  depthTextActive: {
    color: ui.tealDark,
  },
  zoneTarget: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 4,
  },

  // EXPENSE BANNER
  totalExpenseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EBF7F9',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#CCEBF0',
  },
  totalExpLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 1,
  },
  totalExpSub: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 1,
  },
  totalExpValue: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
  },

  // ACTIONS BAR
  actionsBar: {
    gap: 10,
    marginTop: 4,
    marginBottom: 24,
  },
  saveTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ui.tealDark,
    paddingVertical: 15,
    borderRadius: 18,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveTripBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ui.surface,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ui.border,
  },
  cancelBtnText: {
    color: ui.navy,
    fontWeight: '800',
    fontSize: 13,
  },

  // MODAL
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 28, 36, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
  },
  modalSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: '#F8FCFD',
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: ui.navy,
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: ui.tealDark,
  },
  modalSaveText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
