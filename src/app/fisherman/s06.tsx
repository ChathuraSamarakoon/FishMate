import { useState } from 'react';
import {
  Alert,
  Image,
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

const tuna = require('../../../assets/customer/tuna.jpg');
const redSnapper = require('../../../assets/customer/red_snapper.jpg');
const prawns = require('../../../assets/customer/prawns.jpg');
const mackerel = require('../../../assets/customer/mackerel.jpg');
const blueCrab = require('../../../assets/customer/blue_crab.jpg');
const shop1 = require('../../../assets/customer/shop_1.jpg');
const shop2 = require('../../../assets/customer/shop_2.jpg');

const SPECIES_PRESETS = [
  { id: 'tuna', name: 'Yellowfin Tuna (කෙළවල්ලා)', price: 4200, category: 'Premium Pelagic', img: tuna },
  { id: 'snapper', name: 'Red Snapper (තම්බලයා)', price: 3150, category: 'Coastal Catch', img: redSnapper },
  { id: 'prawns', name: 'Jumbo Prawns (ඉස්සෝ)', price: 3650, category: 'Shellfish', img: prawns },
  { id: 'mackerel', name: 'King Mackerel (තෝරා)', price: 2600, category: 'Daily Catch', img: mackerel },
  { id: 'crab', name: 'Blue Crab (කකුළුවෝ)', price: 2950, category: 'Shellfish', img: blueCrab },
];

const PHOTO_PRESETS = [
  { id: 'img-tuna', label: 'Yellowfin Tuna', source: tuna },
  { id: 'img-snapper', label: 'Red Snapper', source: redSnapper },
  { id: 'img-prawns', label: 'Jumbo Sea Prawns', source: prawns },
  { id: 'img-mackerel', label: 'King Mackerel', source: mackerel },
  { id: 'img-crab', label: 'Blue Lagoon Crab', source: blueCrab },
];

const PREPARATION_OPTIONS = [
  'Whole Fish on Ice',
  'Cleaned & Gutted',
  'Steak Cut Packs',
  'De-boned Fillets',
];

const STATUS_OPTIONS: ('Ready stock' | 'Limited stock' | 'Unavailable')[] = [
  'Ready stock',
  'Limited stock',
  'Unavailable',
];

export default function S06AddFishScreen() {
  const { addListing, profile } = useFisherman();

  // 01. UI STATES
  const [selectedSpecies, setSelectedSpecies] = useState(SPECIES_PRESETS[0]);
  const [customName, setCustomName] = useState(SPECIES_PRESETS[0].name);
  const [category, setCategory] = useState(SPECIES_PRESETS[0].category);
  const [weightKg, setWeightKg] = useState('10');
  const [pricePerKg, setPricePerKg] = useState(SPECIES_PRESETS[0].price.toString());
  const [selectedImage, setSelectedImage] = useState<any>(SPECIES_PRESETS[0].img);
  const [stockStatus, setStockStatus] = useState<'Ready stock' | 'Limited stock' | 'Unavailable'>('Ready stock');
  const [freshness, setFreshness] = useState('Landed 1 hr ago at Negombo');
  const [selectedPrep, setSelectedPrep] = useState<string[]>([
    PREPARATION_OPTIONS[0],
    PREPARATION_OPTIONS[1],
  ]);
  const [notes, setNotes] = useState('Chilled on clean crushed ice, direct from Sagara Rani II boat landing.');

  // Validation errors
  const [nameError, setNameError] = useState('');
  const [qtyError, setQtyError] = useState('');
  const [priceError, setPriceError] = useState('');

  // Image picker modal
  const [imagePickerVisible, setImagePickerVisible] = useState(false);

  const weightNum = parseFloat(weightKg) || 0;
  const priceNum = parseFloat(pricePerKg) || 0;
  const totalBatchWorth = weightNum * priceNum;

  // 03. ZERO QTY NAMI UNAVAILABLE RECOMMEND
  const isZeroQty = weightKg.trim() !== '' && weightNum <= 0;

  const handleSelectPreset = (item: typeof SPECIES_PRESETS[0]) => {
    setSelectedSpecies(item);
    setCustomName(item.name);
    setCategory(item.category);
    setPricePerKg(item.price.toString());
    setSelectedImage(item.img);
    setNameError('');
    setPriceError('');
  };

  const handleAdjustWeight = (delta: number) => {
    const next = Math.max(0, weightNum + delta);
    const nextStr = next % 1 === 0 ? next.toString() : next.toFixed(1);
    setWeightKg(nextStr);
    if (next <= 0) {
      setStockStatus('Unavailable');
    } else if (stockStatus === 'Unavailable') {
      setStockStatus('Ready stock');
    }
  };

  const togglePrep = (prep: string) => {
    setSelectedPrep((prev) =>
      prev.includes(prep) ? prev.filter((p) => p !== prep) : [...prev, prep],
    );
  };

  // 03. VALIDATION
  const validateForm = (): boolean => {
    let valid = true;

    if (!customName.trim()) {
      setNameError('Fish name / species is required.');
      valid = false;
    } else {
      setNameError('');
    }

    if (isNaN(weightNum) || weightNum < 0 || (weightNum === 0 && stockStatus !== 'Unavailable')) {
      setQtyError('Available Quantity must be greater than 0 kg (or marked Unavailable).');
      valid = false;
    } else {
      setQtyError('');
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      setPriceError('Price per kg must be greater than Rs. 0.');
      valid = false;
    } else {
      setPriceError('');
    }

    return valid;
  };

  // 02. PUBLISH LISTING -> S05
  const handlePublish = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the highlighted fields before publishing.');
      return;
    }

    // Determine resolved stock label
    const resolvedStock = isZeroQty ? 'Unavailable' : stockStatus;

    addListing({
      id: `listing-${Date.now()}`,
      name: customName.trim(),
      category,
      shortDescription: `${selectedPrep.join(', ')} · ${freshness}`,
      description: notes.trim(),
      price: priceNum,
      unit: '/kg',
      weightLabel: `${weightNum} kg available`,
      availableKg: weightNum,
      stockLabel: resolvedStock,
      freshness: freshness.trim(),
      rating: 5.0,
      reviewCount: 1,
      location: profile.village || 'Negombo Fish Harbor',
      deliveryEta: '30–45 min',
      distance: profile.stallAddress ? 'Harbor Pier' : 'Direct boat landing',
      image: selectedImage ?? tuna,
      sellerId: profile.id || 'fisher-01',
      tags: ['New catch', 'Freshly landed', 'Harbor direct'],
      galleryImages: [selectedImage ?? tuna, shop1, shop2],
      listingDate: 'Today, Just now',
      sellingLocation: `${profile.village} · ${profile.stallAddress ?? 'Stall #14, Pier Gate 02'}`,
    });

    Alert.alert(
      'Catch Published! (S06)',
      `${weightNum} KG of ${customName} published at ${money(priceNum)}/kg (Total batch worth: ${money(totalBatchWorth)}).\n\nYour listing is now live in My Fish Listings (S05) and marketplace customer views.`,
      [
        {
          text: 'View in My Catch (S05)',
          onPress: () => router.replace('/fisherman/listings'),
        },
      ],
    );
  };

  // 02. CANCEL -> S05
  const handleCancel = () => {
    Alert.alert(
      'Discard New Catch?',
      'Are you sure you want to cancel adding this fish listing and return to My Fish Listings?',
      [
        {
          text: 'Discard & Exit',
          style: 'destructive',
          onPress: () => router.replace('/fisherman/listings'),
        },
        { text: 'Keep Editing', style: 'cancel' },
      ],
    );
  };

  return (
    <FishermanShell
      title="S06 · Add Fish Catch"
      subtitle="Publish landed fish to marketplace"
      back
      onBack={handleCancel}
      rightIcon="check"
      rightLabel="Publish"
      onRightPress={handlePublish}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S06</Text>
        </View>
        <Text style={styles.helperText}>Publish freshly landed seafood batch to buyers</Text>
      </View>

      {/* 01. FISH TYPE SELECTOR */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>01. Select Fish Species / Type *</Text>
        <Text style={styles.cardSub}>
          Tap a popular landed catch variety or enter a custom fish species name:
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.speciesScroll}
        >
          {SPECIES_PRESETS.map((item) => {
            const isSelected = selectedSpecies.id === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => handleSelectPreset(item)}
                style={[styles.speciesCard, isSelected && styles.speciesCardSelected]}
              >
                <Image source={item.img} style={styles.speciesImg} resizeMode="cover" />
                <Text
                  numberOfLines={1}
                  style={[styles.speciesName, isSelected && styles.speciesNameSelected]}
                >
                  {item.name}
                </Text>
                <Text style={styles.speciesPrice}>{money(item.price)}/kg</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.inputLabel}>Custom Fish Name / Species Title *</Text>
        <TextInput
          value={customName}
          onChangeText={(val) => {
            setCustomName(val);
            if (nameError) setNameError('');
          }}
          placeholder="e.g. Yellowfin Tuna (කෙළවල්ලා)"
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, nameError ? styles.inputError : null]}
        />
        {nameError ? <Text style={styles.errorText}>⚠ {nameError}</Text> : null}
      </View>

      {/* 01. AVAILABLE QUANTITY (KG) & PRICE PER KG (RS.) */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>02. Available Quantity & Price per KG</Text>

        <View style={styles.rowInputs}>
          {/* AVAILABLE QUANTITY (KG) */}
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Available Qty (kg) *</Text>
            <View style={styles.stepperContainer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity by 1 kg"
                onPress={() => handleAdjustWeight(-1)}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </Pressable>
              <TextInput
                value={weightKg}
                onChangeText={(val) => {
                  setWeightKg(val);
                  if (qtyError) setQtyError('');
                }}
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor={ui.mutedLight}
                style={[styles.stepperInput, qtyError ? styles.inputError : null]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase quantity by 1 kg"
                onPress={() => handleAdjustWeight(1)}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </Pressable>
            </View>
          </View>

          {/* PRICE PER KG (RS.) */}
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Price / kg (Rs.) *</Text>
            <View style={[styles.priceInputBox, priceError ? styles.inputError : null]}>
              <Text style={styles.currencyPrefix}>Rs.</Text>
              <TextInput
                value={pricePerKg}
                onChangeText={(val) => {
                  setPricePerKg(val);
                  if (priceError) setPriceError('');
                }}
                keyboardType="numeric"
                placeholder="4200"
                placeholderTextColor={ui.mutedLight}
                style={styles.priceInput}
              />
            </View>
          </View>
        </View>

        {qtyError ? <Text style={styles.errorText}>⚠ {qtyError}</Text> : null}
        {priceError ? <Text style={styles.errorText}>⚠ {priceError}</Text> : null}

        {/* 03. ZERO QTY NAMI UNAVAILABLE RECOMMEND BANNER */}
        {isZeroQty ? (
          <View style={styles.zeroQtyNotice}>
            <FishermanIcon name="alert" size={16} color={ui.warning} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.zeroQtyTitle}>Zero Quantity Entered</Text>
              <Text style={styles.zeroQtySub}>
                When available catch weight is 0 kg, setting status to &ldquo;Unavailable&rdquo; is recommended so buyers know it is out of stock.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setStockStatus('Unavailable')}
                style={styles.setUnavailableBtn}
              >
                <Text style={styles.setUnavailableBtnText}>
                  {stockStatus === 'Unavailable'
                    ? '✓ Marked as Unavailable'
                    : 'Set Status to "Unavailable"'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* CALCULATED BATCH VALUE */}
        <View style={styles.batchWorthRow}>
          <Text style={styles.batchWorthLabel}>Total Catch Batch Value:</Text>
          <Text style={styles.batchWorthAmount}>{money(totalBatchWorth)}</Text>
        </View>
      </View>

      {/* 01. AVAILABILITY STATUS */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>03. Availability Status</Text>
        <Text style={styles.cardSub}>
          Control whether buyers can place immediate orders or view as out of stock:
        </Text>

        <View style={styles.statusOptionsRow}>
          {STATUS_OPTIONS.map((status) => {
            const isSelected = stockStatus === status;
            return (
              <Pressable
                key={status}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setStockStatus(status)}
                style={[
                  styles.statusChip,
                  isSelected && styles.statusChipSelected,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    status === 'Ready stock'
                      ? styles.dotReady
                      : status === 'Limited stock'
                      ? styles.dotLimited
                      : styles.dotUnavailable,
                  ]}
                />
                <Text
                  style={[
                    styles.statusChipText,
                    isSelected && styles.statusChipTextSelected,
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 01 & 03. FISH IMAGES PICKER & LIVE PREVIEW */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeading}>04. Fish Images Picker & Preview</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setImagePickerVisible(true)}
            style={styles.changeImgBtn}
          >
            <FishermanIcon name="sparkles" size={13} color={ui.tealDark} />
            <Text style={styles.changeImgBtnText}>Change Photo</Text>
          </Pressable>
        </View>
        <Text style={styles.cardSub}>
          Visual catch photo shown to customers on marketplace search:
        </Text>

        {/* 03. IMAGE PREVIEW */}
        <View style={styles.imagePreviewBox}>
          <Image
            source={selectedImage ?? tuna}
            style={styles.imagePreviewLarge}
            resizeMode="cover"
          />
          <View style={styles.previewTagRow}>
            <View style={styles.previewTag}>
              <Text style={styles.previewTagText}>PHOTO PREVIEW</Text>
            </View>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>
                {customName || 'Catch'} · {weightNum} kg
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* FRESHNESS & PREPARATION NOTES */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>05. Freshness & Preparation Options</Text>

        <Text style={styles.inputLabel}>Landing Time & Freshness Tag</Text>
        <TextInput
          value={freshness}
          onChangeText={setFreshness}
          placeholder="e.g. Landed 1 hr ago at Negombo Pier"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>Available Preparation Cuts</Text>
        <View style={styles.prepRow}>
          {PREPARATION_OPTIONS.map((prep) => {
            const active = selectedPrep.includes(prep);
            return (
              <Pressable
                key={prep}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => togglePrep(prep)}
                style={[styles.prepChip, active && styles.prepChipActive]}
              >
                <Text style={[styles.prepChipText, active && styles.prepChipTextActive]}>
                  {active ? '✓ ' : '+ '}
                  {prep}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>Seller Note / Harbor Pier Details</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
          placeholder="Storage instructions, pickup pier gate or ice details..."
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, styles.textArea]}
        />
      </View>

      {/* 02. ACTION BUTTONS: PUBLISH LISTING & CANCEL -> S05 */}
      <View style={styles.actionsBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Publish Listing (S05)"
          onPress={handlePublish}
          style={styles.publishBtn}
        >
          <FishermanIcon name="check" size={17} color="#FFFFFF" />
          <Text style={styles.publishBtnText}>Publish Listing (S05)</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel and return to My Fish Listings (S05)"
          onPress={handleCancel}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Cancel (S05)</Text>
        </Pressable>
      </View>

      {/* FISH PHOTO PICKER MODAL */}
      <Modal
        visible={imagePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setImagePickerVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setImagePickerVisible(false)}
        >
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose Fish Photo</Text>
            <Text style={styles.modalSub}>
              Select a clear catch photo matching your landed fish batch:
            </Text>

            <ScrollView contentContainerStyle={styles.presetsGrid}>
              {PHOTO_PRESETS.map((p) => (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  onPress={() => {
                    setSelectedImage(p.source);
                    setImagePickerVisible(false);
                  }}
                  style={styles.presetItem}
                >
                  <Image source={p.source} style={styles.presetImg} resizeMode="cover" />
                  <Text numberOfLines={1} style={styles.presetLabel}>
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={() => setImagePickerVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
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
    marginBottom: 14,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  cardSub: {
    fontSize: 11,
    color: ui.muted,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speciesScroll: {
    gap: 10,
    paddingBottom: 8,
  },
  speciesCard: {
    width: 125,
    backgroundColor: '#F5FAF9',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#D4ECE7',
    alignItems: 'center',
  },
  speciesCardSelected: {
    backgroundColor: '#E8F6F4',
    borderColor: ui.teal,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  speciesImg: {
    width: 72,
    height: 60,
    borderRadius: 12,
    marginBottom: 6,
  },
  speciesName: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    textAlign: 'center',
  },
  speciesNameSelected: {
    color: ui.tealDark,
    fontWeight: '900',
  },
  speciesPrice: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F7FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    color: ui.navy,
    fontWeight: '600',
  },
  inputError: {
    borderColor: ui.danger,
    backgroundColor: '#FFF7F8',
  },
  errorText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.danger,
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF4F5',
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
  },
  stepperInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    paddingVertical: 10,
  },
  priceInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 12,
    height: 44,
  },
  currencyPrefix: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.tealDark,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    paddingVertical: 8,
  },
  zeroQtyNotice: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF8ED',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    alignItems: 'flex-start',
  },
  zeroQtyTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B76E00',
  },
  zeroQtySub: {
    fontSize: 10,
    color: ui.navy,
    lineHeight: 15,
    marginTop: 2,
    marginBottom: 8,
  },
  setUnavailableBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  setUnavailableBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  batchWorthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5FAF9',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D4ECE7',
  },
  batchWorthLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  batchWorthAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: ui.tealDark,
  },
  statusOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F7FAFB',
    borderWidth: 1,
    borderColor: ui.border,
  },
  statusChipSelected: {
    backgroundColor: '#E8F5F4',
    borderColor: ui.tealDark,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.muted,
  },
  statusChipTextSelected: {
    color: ui.navy,
    fontWeight: '900',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotReady: {
    backgroundColor: ui.success,
  },
  dotLimited: {
    backgroundColor: ui.warning,
  },
  dotUnavailable: {
    backgroundColor: ui.danger,
  },
  changeImgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeImgBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  imagePreviewBox: {
    position: 'relative',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EBF4F6',
    borderWidth: 1,
    borderColor: ui.border,
  },
  imagePreviewLarge: {
    width: '100%',
    height: '100%',
  },
  previewTagRow: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTag: {
    backgroundColor: 'rgba(6, 63, 80, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  previewTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.navy,
  },
  prepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prepChip: {
    backgroundColor: '#F5FAF9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4ECE7',
  },
  prepChipActive: {
    backgroundColor: ui.teal,
    borderColor: ui.tealDark,
  },
  prepChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  prepChipTextActive: {
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  actionsBar: {
    gap: 10,
    marginTop: 6,
    marginBottom: 24,
  },
  publishBtn: {
    backgroundColor: ui.teal,
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  publishBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: ui.surface,
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: ui.muted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 30, 40, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: ui.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D0E0E3',
    alignSelf: 'center',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 16,
  },
  presetItem: {
    width: '48%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F7FAFB',
    borderWidth: 1,
    borderColor: ui.border,
    padding: 6,
  },
  presetImg: {
    width: '100%',
    height: 80,
    borderRadius: 10,
  },
  presetLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 6,
    textAlign: 'center',
  },
  modalCloseBtn: {
    backgroundColor: '#F0F5F7',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  modalCloseText: {
    fontSize: 13,
    fontWeight: '800',
    color: ui.navy,
  },
});
