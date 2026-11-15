import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { TripSaleRecord } from '@/types';

type BuyerType = 'wholesale_auction' | 'restaurant' | 'direct_consumer' | 'retail_stall';
type PaymentStatus = 'paid_cash' | 'paid_bank' | 'pending';
type SourceType = 'harbor_direct' | 'customer_app_order';

const BUYER_PRESETS = [
  'Ocean Fresh Seafood Exporters',
  'The Lagoon Grill Restaurant',
  'Harbor Pier Gate Walk-ins',
  'Negombo Central Fish Market Stall #14',
];

const BUYER_TYPES: { label: string; value: BuyerType }[] = [
  { label: 'Wholesale Auction', value: 'wholesale_auction' },
  { label: 'Restaurant / Hotel', value: 'restaurant' },
  { label: 'Harbor Stall / Retail', value: 'retail_stall' },
  { label: 'Direct Consumer', value: 'direct_consumer' },
];

function generateSaleId() {
  return `sale-${Date.now()}`;
}

export default function S20AddSaleScreen() {
  const { tripId, saleId, from } = useLocalSearchParams<{
    tripId?: string;
    saleId?: string;
    from?: string;
  }>();
  const { trips, addTripSale, updateTripSale } = useFisherman();

  // 01. SELECTED TRIP CONTEXT
  const trip = trips.find((t) => t.id === tripId) || trips[0];
  const existingSale = trip?.salesList?.find((s) => s.id === saleId);
  const isEditing = Boolean(existingSale);

  // Available landed catches on this trip
  const landedCatches = trip?.catches ?? [];
  const landedSpeciesNames = landedCatches.map((c) => c.species);

  // Default fish type: from existing sale, or first landed catch, or preset
  const defaultSpecies = existingSale?.speciesSold || landedSpeciesNames[0] || 'Yellowfin Tuna (Kelawalla)';

  const [buyerName, setBuyerName] = useState(existingSale?.buyerName || BUYER_PRESETS[0]);
  const [buyerType, setBuyerType] = useState<BuyerType>(existingSale?.buyerType || 'wholesale_auction');
  const [speciesSold, setSpeciesSold] = useState(defaultSpecies);
  const [customSpecies, setCustomSpecies] = useState('');
  const [quantityKgText, setQuantityKgText] = useState(existingSale ? String(existingSale.quantityKg) : '20.0');
  const [pricePerKgText, setPricePerKgText] = useState(existingSale ? String(existingSale.pricePerKg) : '2400');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(existingSale?.paymentStatus || 'paid_bank');
  const [sourceType, setSourceType] = useState<SourceType>(existingSale?.sourceType || 'harbor_direct');
  const [orderNumberInput, setOrderNumberInput] = useState(existingSale?.orderNumber || '');

  // Validation error states
  const [qtyError, setQtyError] = useState('');
  const [priceError, setPriceError] = useState('');

  if (!trip) {
    return (
      <View style={styles.sheetBackdrop}>
        <View style={styles.sheetContainer}>
          <Text style={styles.sheetTitle}>Trip Record Not Found</Text>
          <Text style={styles.sheetSubtitle}>The selected fishing voyage could not be found.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/fisherman/trips')}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Back to Trips (S11)</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 03. BEHAVIOR & VALIDATION:
  // Auto-calculated Revenue = qty * price
  const quantityKg = parseFloat(quantityKgText) || 0;
  const pricePerKg = parseFloat(pricePerKgText) || 0;
  const calculatedRevenue = Math.round(quantityKg * pricePerKg);

  // Active species calculation
  const activeSpecies = customSpecies.trim() ? customSpecies.trim() : speciesSold;

  // 03. BEHAVIOR & VALIDATION:
  // Recorded catch quantity exceed validation recommend
  const matchingCatchBatches = landedCatches.filter(
    (c) =>
      c.species.toLowerCase().includes(activeSpecies.toLowerCase().split(' ')[0]) ||
      activeSpecies.toLowerCase().includes(c.species.toLowerCase().split(' ')[0]),
  );

  const totalRecordedLandedForSpecies = matchingCatchBatches.reduce((sum, c) => sum + c.weightKg, 0);

  const alreadySoldOfSpecies = (trip.salesList ?? [])
    .filter(
      (s) =>
        s.id !== saleId &&
        (s.speciesSold.toLowerCase().includes(activeSpecies.toLowerCase().split(' ')[0]) ||
          activeSpecies.toLowerCase().includes(s.speciesSold.toLowerCase().split(' ')[0])),
    )
    .reduce((sum, s) => sum + s.quantityKg, 0);

  const availableCatchForSpecies = Math.max(0, totalRecordedLandedForSpecies - alreadySoldOfSpecies);
  const exceedsCatch = totalRecordedLandedForSpecies > 0 && quantityKg > availableCatchForSpecies;

  const handleAddQty = (inc: number) => {
    const cur = parseFloat(quantityKgText) || 0;
    const next = Math.max(1, cur + inc);
    setQuantityKgText(next.toFixed(1));
    if (next > 0) setQtyError('');
  };

  // 02. CANCEL -> PREVIOUS ACTION
  const handleCancel = () => {
    if (from === 's13') {
      router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } });
    } else if (from === 's19' || !from) {
      router.replace({ pathname: '/fisherman/s19' as never, params: { tripId: trip.id } });
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: '/fisherman/s19' as never, params: { tripId: trip.id } });
    }
  };

  // Execute final save
  const doSaveSale = () => {
    if (isEditing && saleId) {
      updateTripSale(trip.id, saleId, {
        buyerName: buyerName.trim(),
        buyerType,
        speciesSold: activeSpecies,
        quantityKg,
        pricePerKg,
        totalAmount: calculatedRevenue,
        paymentStatus,
        sourceType,
        orderNumber: sourceType === 'customer_app_order' ? (orderNumberInput.trim() || 'ORD-APP-771') : undefined,
      });

      Alert.alert(
        'Sale Updated (S20)',
        `Updated sale to ${buyerName.trim()} (${money(calculatedRevenue)}) on voyage ${trip.tripNumber}.`,
        [
          {
            text: from === 's13' ? 'View Trip Details (S13)' : 'View Sales (S19)',
            onPress: () => {
              if (from === 's13') {
                router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } });
              } else {
                router.replace({ pathname: '/fisherman/s19' as never, params: { tripId: trip.id } });
              }
            },
          },
        ],
      );
    } else {
      const newSale: TripSaleRecord = {
        id: generateSaleId(),
        buyerName: buyerName.trim(),
        buyerType,
        speciesSold: activeSpecies,
        quantityKg,
        pricePerKg,
        totalAmount: calculatedRevenue,
        paymentStatus,
        recordedAt: 'Just now',
        sourceType,
        orderNumber: sourceType === 'customer_app_order' ? (orderNumberInput.trim() || 'ORD-APP-771') : undefined,
      };

      addTripSale(trip.id, newSale);

      Alert.alert(
        'Sale Recorded (S20)',
        `Sale of ${quantityKg.toFixed(1)} kg ${activeSpecies} to ${buyerName} recorded.\nCalculated Revenue: ${money(calculatedRevenue)}.`,
        [
          {
            text: from === 's13' ? 'View Trip Details (S13)' : 'View Sales (S19)',
            onPress: () => {
              if (from === 's13') {
                router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } });
              } else {
                router.replace({ pathname: '/fisherman/s19' as never, params: { tripId: trip.id } });
              }
            },
          },
        ],
      );
    }
  };

  // 02. SAVE SALE -> S19 / S13
  const handleSave = () => {
    if (!buyerName.trim()) {
      Alert.alert('Required Field', 'Please enter or select a buyer name.');
      return;
    }

    // 03. POSITIVE VALUES VALIDATION
    if (quantityKg <= 0 || isNaN(quantityKg)) {
      setQtyError('Quantity sold must be a positive number greater than 0 kg.');
      Alert.alert('Positive Value Required', 'Please enter a positive quantity in kilograms.');
      return;
    }
    setQtyError('');

    if (pricePerKg <= 0 || isNaN(pricePerKg)) {
      setPriceError('Selling price must be a positive number greater than Rs. 0/kg.');
      Alert.alert('Positive Value Required', 'Please enter a positive selling price per kg.');
      return;
    }
    setPriceError('');

    // 03. RECORDED CATCH QUANTITY EXCEED VALIDATION RECOMMENDATION
    if (exceedsCatch) {
      Alert.alert(
        'Recorded Catch Exceeded (Validation Notice)',
        `You entered ${quantityKg.toFixed(1)} kg, but only ${availableCatchForSpecies.toFixed(1)} kg of ${activeSpecies} is recorded as available from this trip's landed haul (${totalRecordedLandedForSpecies.toFixed(1)} kg landed, ${alreadySoldOfSpecies.toFixed(1)} kg already sold).\n\nRecommendation: Adjust to remaining available catch or confirm if selling offloaded catch.`,
        [
          {
            text: `Adjust to ${availableCatchForSpecies.toFixed(1)} kg`,
            onPress: () => setQuantityKgText(availableCatchForSpecies.toFixed(1)),
          },
          {
            text: 'Save Anyway (Confirm Overage)',
            style: 'destructive',
            onPress: () => doSaveSale(),
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
      return;
    }

    doSaveSale();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.sheetBackdrop}
    >
      {/* SEMI-TRANSPARENT BACKDROP (TAP TO CANCEL) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss Modal"
        onPress={handleCancel}
        style={styles.backdropDismissArea}
      />

      {/* BOTTOM-SHEET MODAL CONTAINER */}
      <View style={styles.sheetContainer}>
        {/* GRAB HANDLE PILL */}
        <View style={styles.grabHandle} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER ROW WITH CANCEL BUTTON */}
          <View style={styles.sheetHeaderRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.screenTagRow}>
                <View style={styles.screenTag}>
                  <Text style={styles.screenTagText}>SCREEN S20</Text>
                </View>
                <Text style={styles.sheetSubBadge}>
                  {isEditing ? 'EDIT SALE TRANSACTION' : 'BOTTOM-SHEET SALES LOGGER'}
                </Text>
              </View>
              <Text numberOfLines={1} style={styles.sheetTitle}>
                {isEditing ? 'Edit Sale Transaction' : 'Record Fish Sale'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel and close"
              onPress={handleCancel}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* 01. TRIP INFORMATION CARD */}
          <View style={styles.selectedTripCard}>
            <View style={styles.tripIconWrap}>
              <FishermanIcon name="boat" size={16} color={ui.tealDark} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={styles.tripNameText}>
                Voyage {trip.tripNumber} · {trip.boatName}
              </Text>
              <Text numberOfLines={1} style={styles.tripLocationText}>
                📍 {trip.harbor} · 📅 {trip.tripDate || trip.departureDate.split(',')[0]}
              </Text>
            </View>
            <View style={styles.tripYieldPill}>
              <Text style={styles.yieldPillLabel}>LANDED HAUL</Text>
              <Text style={styles.yieldPillValue}>
                {trip.catches?.reduce((sum, c) => sum + c.weightKg, 0) || trip.catchVolumeKg || 0} KG
              </Text>
            </View>
          </View>

          {/* 01. FISH TYPE SELECTION (PREFILLED FROM TRIP CATCHES) */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionHeading}>1. Select Fish Type from Landed Catch</Text>

            {landedCatches.length > 0 ? (
              <View style={styles.landedCatchesWrap}>
                {landedCatches.map((c) => {
                  const isSelected = speciesSold === c.species && !customSpecies;
                  return (
                    <Pressable
                      key={c.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => {
                        setSpeciesSold(c.species);
                        setCustomSpecies('');
                      }}
                      style={[styles.catchBatchChip, isSelected && styles.catchBatchChipActive]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          style={[styles.catchBatchName, isSelected && styles.catchBatchNameActive]}
                        >
                          🐟 {c.species}
                        </Text>
                        <Text style={styles.catchBatchSub}>
                          Landed: {c.weightKg.toFixed(1)} kg · {c.grade ?? 'Grade A'}
                        </Text>
                      </View>
                      <View style={[styles.catchBatchPill, isSelected && styles.catchBatchPillActive]}>
                        <Text
                          style={[styles.catchBatchPillText, isSelected && styles.catchBatchPillTextActive]}
                        >
                          {c.weightKg.toFixed(1)} kg
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {/* CUSTOM FISH SPECIES */}
            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>OR CUSTOM FISH SPECIES</Text>
            <View style={styles.textInputWrap}>
              <FishermanIcon name="sparkles" size={14} color={ui.tealDark} />
              <TextInput
                value={customSpecies}
                onChangeText={setCustomSpecies}
                placeholder="e.g. Yellowfin Tuna or Seer Steaks"
                placeholderTextColor={ui.muted}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* 01. QUANTITY SOLD (KG) & SELLING PRICE PER KG */}
          <View style={styles.formSection}>
            <View style={styles.pricingRow}>
              {/* QUANTITY SOLD */}
              <View style={styles.priceHalfCol}>
                <View style={styles.qtyHeaderRow}>
                  <Text style={styles.formSectionHeading}>2. Quantity Sold</Text>
                </View>
                <View style={[styles.miniInputRow, qtyError ? styles.inputRowError : null]}>
                  <TextInput
                    value={quantityKgText}
                    onChangeText={(txt) => {
                      setQuantityKgText(txt);
                      const num = parseFloat(txt);
                      if (num > 0) setQtyError('');
                    }}
                    keyboardType="numeric"
                    style={styles.miniInput}
                    placeholder="0.0"
                    placeholderTextColor={ui.muted}
                  />
                  <View style={styles.unitBox}>
                    <Text style={styles.unitText}>KG</Text>
                  </View>
                </View>
                {qtyError ? <Text style={styles.fieldErrorText}>{qtyError}</Text> : null}
              </View>

              {/* SELLING PRICE PER KG */}
              <View style={styles.priceHalfCol}>
                <View style={styles.qtyHeaderRow}>
                  <Text style={styles.formSectionHeading}>3. Price / KG</Text>
                </View>
                <View style={[styles.miniInputRow, priceError ? styles.inputRowError : null]}>
                  <View style={styles.rsPrefixBox}>
                    <Text style={styles.rsPrefixText}>Rs.</Text>
                  </View>
                  <TextInput
                    value={pricePerKgText}
                    onChangeText={(txt) => {
                      setPricePerKgText(txt);
                      const num = parseFloat(txt);
                      if (num > 0) setPriceError('');
                    }}
                    keyboardType="numeric"
                    style={styles.miniInput}
                    placeholder="0"
                    placeholderTextColor={ui.muted}
                  />
                </View>
                {priceError ? <Text style={styles.fieldErrorText}>{priceError}</Text> : null}
              </View>
            </View>

            {/* QUICK INCREMENT BUTTONS */}
            <View style={styles.stepperRow}>
              {[+5, +10, +25, +50].map((step) => (
                <Pressable
                  key={step}
                  accessibilityRole="button"
                  onPress={() => handleAddQty(step)}
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepBtnText}>+{step} kg</Text>
                </Pressable>
              ))}
            </View>

            {/* 03. RECORDED CATCH EXCEED WARNING (IF APPLICABLE) */}
            {exceedsCatch ? (
              <View style={styles.warningStrip}>
                <FishermanIcon name="alert" size={15} color="#D97706" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warningTitle}>Warning: Exceeds Recorded Catch</Text>
                  <Text style={styles.warningBody}>
                    You entered {quantityKg.toFixed(1)} kg, but only {availableCatchForSpecies.toFixed(1)} kg is recorded as remaining for {activeSpecies}.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setQuantityKgText(availableCatchForSpecies.toFixed(1))}
                    style={styles.adjustPill}
                  >
                    <Text style={styles.adjustPillText}>
                      Adjust to {availableCatchForSpecies.toFixed(1)} KG Available
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : totalRecordedLandedForSpecies > 0 ? (
              <View style={styles.catchAvailableStrip}>
                <FishermanIcon name="check" size={13} color="#059669" />
                <Text style={styles.catchAvailableText}>
                  Within catch limit ({availableCatchForSpecies.toFixed(1)} kg available of {totalRecordedLandedForSpecies.toFixed(1)} kg landed)
                </Text>
              </View>
            ) : null}
          </View>

          {/* 01 & 03. AUTO-CALCULATED REVENUE (READ-ONLY) */}
          <View style={styles.revenueReadOnlyCard}>
            <View style={styles.revenueHeaderRow}>
              <View>
                <Text style={styles.revenueReadOnlyLabel}>
                  AUTO-CALCULATED REVENUE (READ-ONLY)
                </Text>
                <Text style={styles.revenueFormulaSmall}>
                  📐 Revenue = Quantity ({quantityKg} kg) × Price/kg (Rs. {pricePerKg.toLocaleString()})
                </Text>
              </View>
              <View style={styles.readOnlyBadge}>
                <Text style={styles.readOnlyBadgeText}>🔒 READ-ONLY</Text>
              </View>
            </View>

            <View style={styles.revenueBigRow}>
              <Text style={styles.revenueBigCurrency}>Rs.</Text>
              <Text style={styles.revenueBigAmount}>
                {calculatedRevenue.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* BUYER INFORMATION & PAYMENT STATUS */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionHeading}>4. Buyer & Payment Details</Text>

            <View style={styles.presetChipsWrap}>
              {BUYER_PRESETS.map((buyer) => {
                const isSelected = buyerName === buyer;
                return (
                  <Pressable
                    key={buyer}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setBuyerName(buyer)}
                    style={[styles.buyerChip, isSelected && styles.buyerChipActive]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[styles.buyerChipText, isSelected && styles.buyerChipTextActive]}
                    >
                      {buyer}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* CUSTOM BUYER NAME */}
            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>OR CUSTOM BUYER NAME</Text>
            <View style={styles.textInputWrap}>
              <FishermanIcon name="user" size={14} color={ui.tealDark} />
              <TextInput
                value={buyerName}
                onChangeText={setBuyerName}
                placeholder="e.g. Starfish Seafoods or Harbor Pier Walk-in"
                placeholderTextColor={ui.muted}
                style={styles.textInput}
              />
            </View>

            {/* BUYER CHANNEL */}
            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>SALES CHANNEL</Text>
            <View style={styles.channelRow}>
              {BUYER_TYPES.map((bt) => {
                const isSelected = buyerType === bt.value;
                return (
                  <Pressable
                    key={bt.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setBuyerType(bt.value)}
                    style={[styles.channelBtn, isSelected && styles.channelBtnActive]}
                  >
                    <Text
                      style={[styles.channelBtnText, isSelected && styles.channelBtnTextActive]}
                    >
                      {bt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* TRANSACTION ORIGIN */}
            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>TRANSACTION ORIGIN</Text>
            <View style={styles.channelRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: sourceType === 'harbor_direct' }}
                onPress={() => setSourceType('harbor_direct')}
                style={[styles.channelBtn, sourceType === 'harbor_direct' && styles.channelBtnActive]}
              >
                <Text
                  style={[
                    styles.channelBtnText,
                    sourceType === 'harbor_direct' && styles.channelBtnTextActive,
                  ]}
                >
                  ⚓ Harbor Direct
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: sourceType === 'customer_app_order' }}
                onPress={() => setSourceType('customer_app_order')}
                style={[styles.channelBtn, sourceType === 'customer_app_order' && styles.channelBtnActive]}
              >
                <Text
                  style={[
                    styles.channelBtnText,
                    sourceType === 'customer_app_order' && styles.channelBtnTextActive,
                  ]}
                >
                  📱 App Order
                </Text>
              </Pressable>
            </View>

            {sourceType === 'customer_app_order' && (
              <View style={[styles.textInputWrap, { marginTop: 8 }]}>
                <FishermanIcon name="orders" size={14} color={ui.tealDark} />
                <TextInput
                  value={orderNumberInput}
                  onChangeText={setOrderNumberInput}
                  placeholder="e.g. ORD-APP-771"
                  placeholderTextColor={ui.muted}
                  style={styles.textInput}
                />
              </View>
            )}

            {/* PAYMENT SETTLEMENT */}
            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>PAYMENT SETTLEMENT</Text>
            <View style={styles.paymentRow}>
              {(
                [
                  { label: 'Bank Transfer', val: 'paid_bank' },
                  { label: 'Cash Handover', val: 'paid_cash' },
                  { label: 'Pending Settlement', val: 'pending' },
                ] as const
              ).map((p) => {
                const isSelected = paymentStatus === p.val;
                return (
                  <Pressable
                    key={p.val}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setPaymentStatus(p.val)}
                    style={[styles.payBtn, isSelected && styles.payBtnActive]}
                  >
                    <Text
                      style={[styles.payBtnText, isSelected && styles.payBtnTextActive]}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 02. BUTTONS & ACTIONS */}
          <View style={styles.actionCol}>
            <Pressable
              accessibilityRole="button"
              onPress={handleSave}
              style={styles.primaryBtn}
            >
              <FishermanIcon name="check" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>
                {isEditing ? 'Save Sale Changes → S19' : 'Save Sale → S19 / S13'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleCancel}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel (Previous)</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // BOTTOM-SHEET MODAL BACKDROP
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropDismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 24,
    maxHeight: '94%',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  grabHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // HEADER ROW
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  screenTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  screenTag: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  screenTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.6,
  },
  sheetSubBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.muted,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: ui.muted,
    marginBottom: 14,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: ui.navy,
  },

  // SELECTED TRIP CARD
  selectedTripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2F0F3',
    marginBottom: 14,
    gap: 10,
  },
  tripIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripNameText: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  tripLocationText: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '600',
    marginTop: 1,
  },
  tripYieldPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  yieldPillLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#065F46',
  },
  yieldPillValue: {
    fontSize: 11,
    fontWeight: '900',
    color: '#059669',
  },

  // FORM SECTIONS
  formSection: {
    marginBottom: 14,
  },
  formSectionHeading: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  landedCatchesWrap: {
    gap: 6,
    marginBottom: 8,
  },
  catchBatchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FCFD',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: ui.border,
  },
  catchBatchChipActive: {
    backgroundColor: '#F0F9FA',
    borderColor: ui.tealDark,
  },
  catchBatchName: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
  },
  catchBatchNameActive: {
    color: ui.tealDark,
    fontWeight: '900',
  },
  catchBatchSub: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 1,
  },
  catchBatchPill: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catchBatchPillActive: {
    backgroundColor: ui.tealDark,
  },
  catchBatchPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  catchBatchPillTextActive: {
    color: '#FFFFFF',
  },
  textInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: ui.navy,
  },

  // PRICING ROW
  pricingRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priceHalfCol: {
    flex: 1,
  },
  qtyHeaderRow: {
    marginBottom: 4,
  },
  miniInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ui.border,
    height: 50,
    overflow: 'hidden',
  },
  inputRowError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  miniInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
    paddingHorizontal: 12,
  },
  unitBox: {
    backgroundColor: ui.tealLight,
    height: '100%',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.tealDark,
  },
  rsPrefixBox: {
    backgroundColor: '#DCFCE7',
    height: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rsPrefixText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#15803D',
  },
  fieldErrorText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '700',
    marginTop: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  stepBtn: {
    flex: 1,
    backgroundColor: '#F0F9FA',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDE5EB',
  },
  stepBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },

  // CATCH EXCEED WARNING
  warningStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 8,
    gap: 8,
  },
  warningTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B45309',
  },
  warningBody: {
    fontSize: 10,
    color: '#92400E',
    marginTop: 2,
    lineHeight: 14,
  },
  adjustPill: {
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  adjustPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  catchAvailableStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  catchAvailableText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },

  // AUTO-CALCULATED REVENUE (READ-ONLY)
  revenueReadOnlyCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    marginBottom: 14,
  },
  revenueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  revenueReadOnlyLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  revenueFormulaSmall: {
    fontSize: 10,
    color: '#047857',
    fontWeight: '700',
    marginTop: 2,
  },
  readOnlyBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  readOnlyBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#065F46',
  },
  revenueBigRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 8,
  },
  revenueBigCurrency: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  revenueBigAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: -0.5,
  },

  // BUYER & PAYMENT
  presetChipsWrap: {
    gap: 6,
  },
  buyerChip: {
    backgroundColor: '#F8FCFD',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ui.border,
  },
  buyerChipActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  buyerChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.navy,
  },
  buyerChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  channelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  channelBtn: {
    backgroundColor: '#F8FCFD',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ui.border,
  },
  channelBtnActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  channelBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.navy,
  },
  channelBtnTextActive: {
    color: '#0369A1',
    fontWeight: '900',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 6,
  },
  payBtn: {
    flex: 1,
    backgroundColor: '#F8FCFD',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  payBtnActive: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  payBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.navy,
  },
  payBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  // BUTTONS & ACTIONS
  actionCol: {
    gap: 8,
    marginTop: 6,
  },
  primaryBtn: {
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
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: '#F8FCFD',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
  },
});
