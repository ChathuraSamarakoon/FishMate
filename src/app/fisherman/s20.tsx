import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';
import type { TripSaleRecord } from '@/types';

type BuyerType = 'wholesale_auction' | 'restaurant' | 'direct_consumer' | 'retail_stall';
type PaymentStatus = 'paid_cash' | 'paid_bank' | 'pending';

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
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { trips, addTripSale } = useFisherman();

  const trip = trips.find((t) => t.id === tripId) || trips[0];

  const [buyerName, setBuyerName] = useState(BUYER_PRESETS[0]);
  const [buyerType, setBuyerType] = useState<BuyerType>('wholesale_auction');
  const [speciesSold, setSpeciesSold] = useState('Yellowfin Tuna (Grade A)');
  const [quantityKgText, setQuantityKgText] = useState('20.0');
  const [pricePerKgText, setPricePerKgText] = useState('2400');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid_bank');

  if (!trip) {
    return (
      <FishermanShell
        back
        title="S20 · Record Sale"
        subtitle="Trip not found"
        onBack={() => router.replace('/fisherman/trips')}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Trip Record Not Found</Text>
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

  const quantityKg = parseFloat(quantityKgText) || 0;
  const pricePerKg = parseFloat(pricePerKgText) || 0;
  const totalAmount = Math.round(quantityKg * pricePerKg);

  const handleAddQty = (inc: number) => {
    const cur = parseFloat(quantityKgText) || 0;
    setQuantityKgText(Math.max(1, cur + inc).toFixed(1));
  };

  const handleSave = () => {
    if (!buyerName.trim()) {
      Alert.alert('Required Field', 'Please enter or select a buyer name.');
      return;
    }

    if (quantityKg <= 0 || pricePerKg <= 0) {
      Alert.alert('Invalid Sale Numbers', 'Please enter positive values for quantity and unit price.');
      return;
    }

    const newSale: TripSaleRecord = {
      id: generateSaleId(),
      buyerName: buyerName.trim(),
      buyerType,
      speciesSold: speciesSold.trim() || 'Mixed Fish Batch',
      quantityKg,
      pricePerKg,
      totalAmount,
      paymentStatus,
      recordedAt: 'Just now',
    };

    addTripSale(trip.id, newSale);

    Alert.alert(
      'Sale Recorded (S20)',
      `Sale of ${quantityKg} kg ${speciesSold} to ${buyerName} recorded.\nGross Revenue: ${money(totalAmount)}.`,
      [
        {
          text: 'View Trip Details (S13)',
          onPress: () => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } }),
        },
      ],
    );
  };

  return (
    <FishermanShell
      title={`S20 · Record Sale (${trip.tripNumber})`}
      subtitle="Fish buyer dispatch & revenue receipt"
      back
      onBack={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S20</Text>
        </View>
        <Text numberOfLines={1} style={styles.helperText}>
          Add revenue transaction to voyage {trip.tripNumber}
        </Text>
      </View>

      {/* FORM CARD */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Buyer Information</Text>

        {/* BUYER PRESETS */}
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
                <Text style={[styles.buyerChipText, isSelected && styles.buyerChipTextActive]}>
                  {buyer}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* CUSTOM BUYER INPUT */}
        <Text style={[styles.label, { marginTop: 12 }]}>OR CUSTOM BUYER NAME</Text>
        <TextInput
          value={buyerName}
          onChangeText={setBuyerName}
          placeholder="e.g. Starfish Seafoods or Negombo Pier Walk-in"
          placeholderTextColor={ui.muted}
          style={styles.input}
        />

        {/* BUYER TYPE */}
        <Text style={[styles.label, { marginTop: 14 }]}>BUYER CHANNEL</Text>
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
                <Text style={[styles.channelBtnText, isSelected && styles.channelBtnTextActive]}>
                  {bt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* SPECIES SOLD */}
        <Text style={[styles.label, { marginTop: 14 }]}>FISH SPECIES / CUTS</Text>
        <TextInput
          value={speciesSold}
          onChangeText={setSpeciesSold}
          placeholder="e.g. Yellowfin Tuna or Seer Steaks"
          placeholderTextColor={ui.muted}
          style={styles.input}
        />

        {/* QUANTITY & UNIT PRICE ROW */}
        <View style={styles.pricingGrid}>
          <View style={styles.priceCell}>
            <Text style={styles.label}>QUANTITY (KG)</Text>
            <View style={styles.priceInputRow}>
              <TextInput
                value={quantityKgText}
                onChangeText={setQuantityKgText}
                keyboardType="numeric"
                style={styles.miniInput}
                placeholder="0"
              />
              <Text style={styles.unitSuffix}>KG</Text>
            </View>
          </View>

          <View style={styles.priceCell}>
            <Text style={styles.label}>RATE / KG (RS.)</Text>
            <View style={styles.priceInputRow}>
              <TextInput
                value={pricePerKgText}
                onChangeText={setPricePerKgText}
                keyboardType="numeric"
                style={styles.miniInput}
                placeholder="0"
              />
              <Text style={styles.unitSuffix}>/KG</Text>
            </View>
          </View>
        </View>

        {/* QUICK QUANTITY BUTTONS */}
        <View style={styles.incRow}>
          {[+5, +10, +25, +50].map((inc) => (
            <Pressable
              key={inc}
              accessibilityRole="button"
              onPress={() => handleAddQty(inc)}
              style={styles.incBtn}
            >
              <Text style={styles.incBtnText}>+{inc} kg</Text>
            </Pressable>
          ))}
        </View>

        {/* TOTAL SALE REVENUE CALLOUT */}
        <View style={styles.revenueCallout}>
          <Text style={styles.revenueCalloutLabel}>TOTAL SALE REVENUE</Text>
          <Text style={styles.revenueCalloutAmount}>+ {money(totalAmount)}</Text>
          <Text style={styles.revenueCalloutSub}>
            {quantityKg} kg × Rs. {pricePerKg.toLocaleString()}/kg
          </Text>
        </View>

        {/* PAYMENT STATUS */}
        <Text style={[styles.label, { marginTop: 14 }]}>PAYMENT SETTLEMENT</Text>
        <View style={styles.paymentStatusRow}>
          {(
            [
              { label: 'Bank Transfer', val: 'paid_bank' },
              { label: 'Cash Handover', val: 'paid_cash' },
              { label: 'Pending Credit', val: 'pending' },
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
                <Text style={[styles.payBtnText, isSelected && styles.payBtnTextActive]}>
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actionsCol}>
        <Pressable
          accessibilityRole="button"
          onPress={handleSave}
          style={styles.saveBtn}
        >
          <FishermanIcon name="plus" size={15} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Record Sale → S13</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace({ pathname: '/fisherman/s13' as never, params: { id: trip.id } })}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
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
  card: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 10,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  presetChipsWrap: {
    gap: 6,
  },
  buyerChip: {
    backgroundColor: '#F8FCFD',
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  input: {
    backgroundColor: '#F8FCFD',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 12,
    color: ui.navy,
    fontWeight: '700',
  },
  channelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  channelBtn: {
    backgroundColor: '#F8FCFD',
    paddingHorizontal: 10,
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
  pricingGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  priceCell: {
    flex: 1,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 10,
    height: 46,
  },
  miniInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
  },
  unitSuffix: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.muted,
  },
  incRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  incBtn: {
    flex: 1,
    backgroundColor: '#F0F9FA',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDE5EB',
  },
  incBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  revenueCallout: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  revenueCalloutLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  revenueCalloutAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  revenueCalloutSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  paymentStatusRow: {
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
  actionsCol: {
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
});
