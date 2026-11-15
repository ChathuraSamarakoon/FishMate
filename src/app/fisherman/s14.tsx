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
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

const FISHING_ZONES = [
  { id: 'z1', name: 'Negombo Offshore Basin (18 nm)', target: 'Yellowfin Tuna & Skipjack', depth: '240m' },
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
  '09:15 AM',
  '11:00 AM',
  '01:30 PM',
  '04:00 PM',
];

const RETURN_PRESETS_OVERNIGHT = [
  '05:30 AM (+1 Day)',
  '07:00 AM (+1 Day)',
  '09:15 AM (+1 Day)',
  '12:00 PM (+1 Day)',
];

export default function S14EditTripScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { trips, profile, updateTrip } = useFisherman();

  // Find target trip
  const trip = trips.find((t) => t.id === id) || trips[0];

  // Helper to parse prefilled date and time
  const initialDate = trip?.tripDate || (trip?.departureDate ? trip.departureDate.split(',')[0] : 'Today, 15 Nov 2026');
  const initialDepartureTime = trip?.departureDate && trip.departureDate.includes(',')
    ? trip.departureDate.split(',')[1]?.trim() || '03:30 AM'
    : '03:30 AM';
  const initialReturnTime = trip?.returnDate || '09:15 AM';

  // 01. PREFILLED FORM STATES
  const [tripDate, setTripDate] = useState(initialDate);
  const [departureTime, setDepartureTime] = useState(initialDepartureTime);
  const [returnTime, setReturnTime] = useState(initialReturnTime);
  const [isOvernight, setIsOvernight] = useState(Boolean(trip?.isOvernight));

  const [fishingLocation, setFishingLocation] = useState(trip?.harbor || FISHING_ZONES[0].name);
  const [boatName, setBoatName] = useState(trip?.boatName || profile.boatName || 'Sagara Rani II');
  const [boatRegNumber, setBoatRegNumber] = useState(profile.registrationNumber ?? 'CFV-A-4198-NEG');
  const [boatMooring, setBoatMooring] = useState(profile.harborMooring ?? 'Berth A-07, Pier Gate 02');
  const [crewCount, setCrewCount] = useState(trip?.crewCount ? String(trip.crewCount) : '4');

  // Validation errors
  const [dateError, setDateError] = useState('');
  const [depTimeError, setDepTimeError] = useState('');
  const [retTimeError, setRetTimeError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [boatError, setBoatError] = useState('');

  // Custom date picker modal
  const [customDateModalVisible, setCustomDateModalVisible] = useState(false);
  const [customDateInput, setCustomDateInput] = useState(initialDate);

  if (!trip) {
    return (
      <FishermanShell
        back
        title="S14 · Trip Not Found"
        subtitle="Voyage record unavailable"
        onBack={() => router.replace('/fisherman/trips')}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Trip Record Not Found</Text>
          <Text style={styles.subText}>This fishing voyage log could not be located.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/fisherman/trips')}
            style={styles.saveBtn}
          >
            <Text style={styles.saveBtnText}>Back to Trips (S11)</Text>
          </Pressable>
        </View>
      </FishermanShell>
    );
  }

  // Preserved related data tallies
  const catchesCount = trip.catches?.length ?? 0;
  const catchesWeight = trip.catches?.reduce((sum, c) => sum + c.weightKg, 0) || trip.catchVolumeKg || 0;
  const expensesCount = trip.expensesList?.length ?? 0;
  const expensesAmount = trip.expensesList?.reduce((sum, e) => sum + e.amount, 0)
    || ((trip.fuelCost || 0) + (trip.iceBaitCost || 0) + (trip.otherCost || 0));
  const salesCount = trip.salesList?.length ?? 0;
  const salesAmount = trip.salesList?.reduce((sum, s) => sum + s.totalAmount, 0) || trip.revenue || 0;

  // Form validation
  const validateForm = (): boolean => {
    let isValid = true;

    if (!tripDate.trim()) {
      setDateError('Trip Date is required.');
      isValid = false;
    } else {
      setDateError('');
    }

    if (!departureTime.trim()) {
      setDepTimeError('Departure Time is required.');
      isValid = false;
    } else {
      setDepTimeError('');
    }

    if (!returnTime.trim()) {
      setRetTimeError('Return Time is required.');
      isValid = false;
    } else {
      setRetTimeError('');
    }

    if (!fishingLocation.trim()) {
      setLocationError('Fishing Location / Zone is required.');
      isValid = false;
    } else {
      setLocationError('');
    }

    if (!boatName.trim() || !boatRegNumber.trim()) {
      setBoatError('Boat vessel name and registration number are required.');
      isValid = false;
    } else {
      setBoatError('');
    }

    return isValid;
  };

  // 02. SAVE CHANGES -> S13
  const handleSaveChanges = () => {
    if (!validateForm()) {
      Alert.alert(
        'Validation Required',
        'Please complete all required fields (Date, Departure/Return times, Fishing Location, and Boat Details).',
      );
      return;
    }

    // 03. BEHAVIOR & VALIDATION:
    // Related catch / expense / sales data PRESERVE strictly intact
    updateTrip(trip.id, {
      tripDate: tripDate.trim(),
      departureDate: `${tripDate.split(',')[0]} ${departureTime.trim()}`,
      returnDate: isOvernight ? `${returnTime.trim()} (Overnight)` : returnTime.trim(),
      harbor: fishingLocation.trim(),
      boatName: boatName.trim(),
      crewCount: parseInt(crewCount, 10) || trip.crewCount || 4,
      isOvernight,
      // catches, expensesList, salesList, revenue, expenses, profit are safely preserved
    });

    Alert.alert(
      'Changes Saved (S14)',
      `Voyage ${trip.tripNumber} parameters have been updated.\n\nAll ${catchesCount} catch records, ${expensesCount} expenses and ${salesCount} sales remain safely preserved.`,
      [
        {
          text: 'View Trip Details (S13)',
          onPress: () => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } }),
        },
      ],
    );
  };

  // 02. CANCEL -> S13
  const handleCancel = () => {
    router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } });
  };

  const returnPresets = isOvernight ? RETURN_PRESETS_OVERNIGHT : RETURN_PRESETS_DAY;

  return (
    <FishermanShell
      title={`S14 · Edit ${trip.tripNumber}`}
      subtitle="Modify voyage parameters & schedule"
      back
      onBack={handleCancel}
    >
      {/* SCREEN BREADCRUMB */}
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S14</Text>
        </View>
        <Text numberOfLines={1} style={styles.helperText}>
          Prefilled Date, Times, Location & Boat Details
        </Text>
      </View>

      {/* 03. PRESERVED DATA STATUS BANNER */}
      <View style={styles.preserveBanner}>
        <View style={styles.preserveIconWrap}>
          <FishermanIcon name="check" size={16} color="#059669" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.preserveTitle}>Linked Catch, Expense & Sales Data Preserved</Text>
          <Text style={styles.preserveSub}>
            🐟 {catchesCount} Catches ({catchesWeight.toFixed(1)} kg) · 💳 {expensesCount} Expenses ({money(expensesAmount)}) · 💰 {salesCount} Sales ({money(salesAmount)})
          </Text>
          <Text style={styles.preserveNote}>
            Editing trip parameters will not alter or delete any existing financial records.
          </Text>
        </View>
      </View>

      {/* 01. PREFILLED DATE SECTION */}
      <View style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Trip Voyage Date</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setCustomDateModalVisible(true)}
            style={styles.calendarPill}
          >
            <FishermanIcon name="clock" size={12} color={ui.tealDark} />
            <Text style={styles.calendarPillText}>Custom Date</Text>
          </Pressable>
        </View>

        <View style={styles.presetChipsWrap}>
          {DATE_PRESETS.map((preset) => {
            const isSelected = tripDate.includes(preset.value) || tripDate === preset.value;
            return (
              <Pressable
                key={preset.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  setTripDate(preset.value);
                  setDateError('');
                }}
                style={[styles.dateChip, isSelected && styles.dateChipActive]}
              >
                <Text style={[styles.dateChipText, isSelected && styles.dateChipTextActive]}>
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.inputWrap}>
          <FishermanIcon name="clock" size={15} color={ui.tealDark} />
          <TextInput
            value={tripDate}
            onChangeText={(txt) => {
              setTripDate(txt);
              if (txt.trim()) setDateError('');
            }}
            placeholder="e.g. Today, 15 Nov 2026"
            placeholderTextColor={ui.muted}
            style={styles.input}
          />
        </View>
        {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
      </View>

      {/* 01. DEPARTURE & RETURN TIME SECTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Departure & Return Timings</Text>

        {/* OVERNIGHT TOGGLE */}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isOvernight }}
          onPress={() => setIsOvernight((prev) => !prev)}
          style={[styles.overnightBox, isOvernight && styles.overnightBoxActive]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.overnightTitle}>🌙 Overnight Sea Voyage</Text>
            <Text style={styles.overnightSub}>
              Select for trips returning the following calendar day
            </Text>
          </View>
          <View style={[styles.switchTrack, isOvernight && styles.switchTrackActive]}>
            <View style={[styles.switchThumb, isOvernight && styles.switchThumbActive]} />
          </View>
        </Pressable>

        {/* DEPARTURE TIME */}
        <Text style={[styles.label, { marginTop: 14 }]}>DEPARTURE TIME</Text>
        <View style={styles.presetChipsWrap}>
          {DEPARTURE_PRESETS.map((dep) => {
            const isSelected = departureTime === dep || departureTime === dep.split(' ')[0];
            return (
              <Pressable
                key={dep}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  setDepartureTime(dep);
                  setDepTimeError('');
                }}
                style={[styles.timeChip, isSelected && styles.timeChipActive]}
              >
                <Text style={[styles.timeChipText, isSelected && styles.timeChipTextActive]}>
                  {dep}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.inputWrap}>
          <FishermanIcon name="clock" size={15} color={ui.tealDark} />
          <TextInput
            value={departureTime}
            onChangeText={(txt) => {
              setDepartureTime(txt);
              if (txt.trim()) setDepTimeError('');
            }}
            placeholder="e.g. 03:30 AM"
            placeholderTextColor={ui.muted}
            style={styles.input}
          />
        </View>
        {depTimeError ? <Text style={styles.errorText}>{depTimeError}</Text> : null}

        {/* RETURN TIME */}
        <Text style={[styles.label, { marginTop: 14 }]}>
          RETURN / LANDING TIME {isOvernight ? '(NEXT MORNING)' : '(SAME DAY)'}
        </Text>
        <View style={styles.presetChipsWrap}>
          {returnPresets.map((ret) => {
            const isSelected = returnTime === ret || returnTime === ret.split(' ')[0];
            return (
              <Pressable
                key={ret}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  setReturnTime(ret);
                  setRetTimeError('');
                }}
                style={[styles.timeChip, isSelected && styles.timeChipActive]}
              >
                <Text style={[styles.timeChipText, isSelected && styles.timeChipTextActive]}>
                  {ret}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.inputWrap}>
          <FishermanIcon name="sparkles" size={15} color={ui.tealDark} />
          <TextInput
            value={returnTime}
            onChangeText={(txt) => {
              setReturnTime(txt);
              if (txt.trim()) setRetTimeError('');
            }}
            placeholder={isOvernight ? 'e.g. 09:15 AM (+1 Day)' : 'e.g. 09:15 AM'}
            placeholderTextColor={ui.muted}
            style={styles.input}
          />
        </View>
        {retTimeError ? <Text style={styles.errorText}>{retTimeError}</Text> : null}
      </View>

      {/* 01. FISHING LOCATION SECTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Fishing Location & Waypoint</Text>

        <View style={styles.zoneList}>
          {FISHING_ZONES.map((zone) => {
            const isSelected = fishingLocation === zone.name;
            return (
              <Pressable
                key={zone.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  setFishingLocation(zone.name);
                  setLocationError('');
                }}
                style={[styles.zoneCard, isSelected && styles.zoneCardActive]}
              >
                <View style={styles.zoneTopRow}>
                  <FishermanIcon
                    name="pin"
                    size={14}
                    color={isSelected ? ui.tealDark : ui.muted}
                  />
                  <Text style={[styles.zoneName, isSelected && styles.zoneNameActive]}>
                    {zone.name}
                  </Text>
                </View>
                <Text style={styles.zoneDetails}>
                  Target: {zone.target} · Depth {zone.depth}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>CUSTOM LOCATION NAME</Text>
        <View style={styles.inputWrap}>
          <FishermanIcon name="pin" size={15} color={ui.tealDark} />
          <TextInput
            value={fishingLocation}
            onChangeText={(txt) => {
              setFishingLocation(txt);
              if (txt.trim()) setLocationError('');
            }}
            placeholder="e.g. Negombo Offshore Basin (18 nm)"
            placeholderTextColor={ui.muted}
            style={styles.input}
          />
        </View>
        {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}
      </View>

      {/* 01. BOAT DETAILS SECTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Boat & Vessel Details</Text>

        <Text style={styles.label}>FISHING VESSEL NAME</Text>
        <View style={styles.inputWrap}>
          <FishermanIcon name="boat" size={15} color={ui.tealDark} />
          <TextInput
            value={boatName}
            onChangeText={(txt) => {
              setBoatName(txt);
              if (txt.trim()) setBoatError('');
            }}
            placeholder="e.g. Sagara Rani II"
            placeholderTextColor={ui.muted}
            style={styles.input}
          />
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>REGISTRATION NUMBER</Text>
        <View style={styles.inputWrap}>
          <FishermanIcon name="revenue" size={15} color={ui.tealDark} />
          <TextInput
            value={boatRegNumber}
            onChangeText={setBoatRegNumber}
            placeholder="e.g. CFV-A-4198-NEG"
            placeholderTextColor={ui.muted}
            style={styles.input}
          />
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>HARBOR MOORING BERTH</Text>
        <View style={styles.inputWrap}>
          <FishermanIcon name="pin" size={15} color={ui.tealDark} />
          <TextInput
            value={boatMooring}
            onChangeText={setBoatMooring}
            placeholder="e.g. Berth A-07, Pier Gate 02"
            placeholderTextColor={ui.muted}
            style={styles.input}
          />
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>CREW MEMBERS COUNT</Text>
        <View style={styles.crewRow}>
          {['2', '3', '4', '5', '6'].map((c) => (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityState={{ selected: crewCount === c }}
              onPress={() => setCrewCount(c)}
              style={[styles.crewBtn, crewCount === c && styles.crewBtnActive]}
            >
              <Text style={[styles.crewBtnText, crewCount === c && styles.crewBtnTextActive]}>
                {c} Sailors
              </Text>
            </Pressable>
          ))}
        </View>
        {boatError ? <Text style={styles.errorText}>{boatError}</Text> : null}
      </View>

      {/* 02. BUTTONS & NAVIGATION (SAVE CHANGES & CANCEL) */}
      <View style={styles.actionCol}>
        <Pressable
          accessibilityRole="button"
          onPress={handleSaveChanges}
          style={styles.saveBtn}
        >
          <FishermanIcon name="check" size={16} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Changes → S13</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={handleCancel}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Cancel (Back to S13)</Text>
        </Pressable>
      </View>

      {/* CUSTOM DATE PICKER MODAL */}
      <Modal
        visible={customDateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomDateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Voyage Date</Text>
            <Text style={styles.modalSubtitle}>Format: Day, DD Mon YYYY</Text>

            <TextInput
              value={customDateInput}
              onChangeText={setCustomDateInput}
              placeholder="e.g. 18 Nov 2026"
              placeholderTextColor={ui.muted}
              style={styles.modalInput}
            />

            <View style={styles.modalActionsRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setCustomDateModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  if (customDateInput.trim()) {
                    setTripDate(customDateInput.trim());
                    setDateError('');
                  }
                  setCustomDateModalVisible(false);
                }}
                style={styles.modalConfirmBtn}
              >
                <Text style={styles.modalConfirmText}>Apply Date</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  card: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 6,
  },
  subText: {
    fontSize: 12,
    color: ui.muted,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calendarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  calendarPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },

  // PRESERVED BANNER
  preserveBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 14,
    gap: 10,
  },
  preserveIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  preserveTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#065F46',
  },
  preserveSub: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
    marginTop: 3,
  },
  preserveNote: {
    fontSize: 10,
    color: '#065F46',
    marginTop: 4,
  },

  // CHIPS & INPUTS
  presetChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  dateChip: {
    backgroundColor: '#F8FCFD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ui.border,
  },
  dateChipActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  dateChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
  },
  dateChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  timeChip: {
    backgroundColor: '#F8FCFD',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ui.border,
  },
  timeChipActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  timeChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.navy,
  },
  timeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: ui.navy,
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
    fontWeight: '600',
  },

  // OVERNIGHT TOGGLE
  overnightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 10,
  },
  overnightBoxActive: {
    backgroundColor: '#FAF5FF',
    borderColor: '#C084FC',
  },
  overnightTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  overnightSub: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 2,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchTrackActive: {
    backgroundColor: '#9333EA',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },

  // ZONES
  zoneList: {
    gap: 8,
    marginBottom: 8,
  },
  zoneCard: {
    backgroundColor: '#F8FCFD',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: ui.border,
  },
  zoneCardActive: {
    backgroundColor: '#F0F9FA',
    borderColor: ui.tealDark,
  },
  zoneTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zoneName: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
  },
  zoneNameActive: {
    color: ui.tealDark,
  },
  zoneDetails: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 3,
  },

  // CREW MEMBERS
  crewRow: {
    flexDirection: 'row',
    gap: 6,
  },
  crewBtn: {
    flex: 1,
    backgroundColor: '#F8FCFD',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  crewBtnActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  crewBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.navy,
  },
  crewBtnTextActive: {
    color: '#FFFFFF',
  },

  // ACTIONS
  actionCol: {
    gap: 10,
    marginBottom: 30,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: ui.tealDark,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: ui.surface,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: ui.navy,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
  },
  modalSubtitle: {
    fontSize: 12,
    color: ui.muted,
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: '#F8FCFD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: ui.navy,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.muted,
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: ui.tealDark,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
