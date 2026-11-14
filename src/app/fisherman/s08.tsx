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
  type ImageSourcePropType,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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
  { id: 'img-shop1', label: 'Harbor Cold Stall', source: shop1 },
  { id: 'img-shop2', label: 'Vessel Landing Deck', source: shop2 },
];

const CATEGORY_OPTIONS = [
  'Premium Pelagic',
  'Coastal Catch',
  'Shellfish',
  'Daily Catch',
  'Lagoon Variety',
];

const STATUS_OPTIONS: ('Ready stock' | 'Limited stock' | 'Unavailable')[] = [
  'Ready stock',
  'Limited stock',
  'Unavailable',
];

export default function S08EditListingScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { listings, updateListing } = useFisherman();

  // Find the target listing
  const listing = listings.find((l) => l.id === id) || listings[0];

  // 01. PRE-FILLED FORM STATES (Hooks declared unconditionally at top)
  const [name, setName] = useState(listing ? listing.name : '');
  const [category, setCategory] = useState(listing ? listing.category : CATEGORY_OPTIONS[0]);
  const [pricePerKg, setPricePerKg] = useState(listing ? listing.price.toString() : '4200');
  const [availableKg, setAvailableKg] = useState(
    listing ? (listing.availableKg ?? 10).toString() : '10',
  );
  const [selectedPhoto, setSelectedPhoto] = useState<ImageSourcePropType>(
    listing ? listing.image : tuna,
  );
  const [stockStatus, setStockStatus] = useState<'Ready stock' | 'Limited stock' | 'Unavailable'>(
    listing ? ((listing.stockLabel as any) || 'Ready stock') : 'Ready stock',
  );
  const [freshness, setFreshness] = useState(
    listing ? listing.freshness : 'Caught this morning · Landed at Negombo Pier',
  );
  const [shortDesc, setShortDesc] = useState(listing ? listing.shortDescription : '');
  const [description, setDescription] = useState(listing ? listing.description : '');

  // Validation error states (Identical to S06)
  const [nameError, setNameError] = useState('');
  const [qtyError, setQtyError] = useState('');
  const [priceError, setPriceError] = useState('');

  // Photo picker modal
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);

  if (!listing) {
    return (
      <FishermanShell
        back
        title="S08 · Edit Catch"
        subtitle="Catch listing unavailable"
        onBack={() => router.replace('/fisherman/listings')}
      >
        <View style={styles.notFoundCard}>
          <Text style={styles.notFoundTitle}>Catch Listing Not Found</Text>
          <Text style={styles.notFoundSub}>
            This listing could not be found in your active inventory.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/fisherman/listings')}
            style={styles.notFoundBtn}
          >
            <Text style={styles.notFoundBtnText}>Back to My Listings (S05)</Text>
          </Pressable>
        </View>
      </FishermanShell>
    );
  }

  // Derived metrics
  const weightNum = parseFloat(availableKg) || 0;
  const priceNum = parseFloat(pricePerKg) || 0;
  const totalBatchWorth = weightNum * priceNum;

  // 03. ZERO QTY RECOMMENDATION (SAME AS S06)
  const isZeroQty = availableKg.trim() !== '' && weightNum <= 0;

  // Preset selection handler
  const handleSelectPreset = (item: (typeof SPECIES_PRESETS)[0]) => {
    setName(item.name);
    setCategory(item.category);
    setPricePerKg(item.price.toString());
    setSelectedPhoto(item.img);
    setNameError('');
    setPriceError('');
  };

  // Quantity stepper adjustments
  const handleAdjustWeight = (delta: number) => {
    const next = Math.max(0, weightNum + delta);
    const nextStr = next % 1 === 0 ? next.toString() : next.toFixed(1);
    setAvailableKg(nextStr);
    if (next <= 0) {
      setStockStatus('Unavailable');
    } else if (stockStatus === 'Unavailable') {
      setStockStatus('Ready stock');
    }
    setQtyError('');
  };

  // 03. VALIDATION (IDENTICAL TO S06)
  const validateForm = (): boolean => {
    let valid = true;

    if (!name.trim()) {
      setNameError('Fish species / name is required.');
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
      setPriceError('Unit Price per kg must be greater than Rs. 0.');
      valid = false;
    } else {
      setPriceError('');
    }

    return valid;
  };

  // 02. SAVE CHANGES -> S05 / S07
  const handleSave = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the highlighted fields before saving.');
      return;
    }

    // Determine resolved stock label
    const resolvedStock = isZeroQty ? 'Unavailable' : stockStatus;

    updateListing(listing.id, {
      name: name.trim(),
      category,
      price: priceNum,
      availableKg: weightNum,
      weightLabel: `${weightNum} kg available`,
      image: selectedPhoto,
      stockLabel: resolvedStock,
      freshness: freshness.trim(),
      shortDescription: shortDesc.trim(),
      description: description.trim(),
      galleryImages: [selectedPhoto, shop1, shop2],
    });

    Alert.alert(
      'Changes Saved! (S08)',
      `${name} has been updated with ${weightNum} kg at ${money(priceNum)}/kg (Total batch worth: ${money(totalBatchWorth)}).\n\nChanges are immediately active in your inventory and customer view.`,
      [
        {
          text: 'View in Details (S07)',
          onPress: () =>
            router.replace({ pathname: '/fisherman/s07', params: { id: listing.id } } as never),
        },
        {
          text: 'My Fish Listings (S05)',
          onPress: () => router.replace('/fisherman/listings'),
        },
      ],
    );
  };

  // 02. CANCEL -> S07
  const handleCancel = () => {
    router.replace({ pathname: '/fisherman/s07', params: { id: listing.id } } as never);
  };

  return (
    <FishermanShell
      title="S08 · Edit Catch"
      subtitle={`Edit ${listing.name}`}
      back
      onBack={handleCancel}
      rightIcon="check"
      rightLabel="Save Changes"
      onRightPress={handleSave}
    >
      {/* SCREEN BREADCRUMB */}
      <View style={styles.breadcrumbRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S08</Text>
        </View>
        <Text numberOfLines={1} style={styles.breadcrumbText}>
          Edit catch species, stock weight, price & photos
        </Text>
      </View>

      {/* 01. ACTIVE CATCH HEADER WITH LIVE THUMBNAIL */}
      <View style={styles.headerCard}>
        <Image source={selectedPhoto} style={styles.headerImg} resizeMode="cover" />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={styles.headerName}>
            {name || 'Fish Name'}
          </Text>
          <Text style={styles.headerCategory}>{category}</Text>
          <Text style={styles.batchValueText}>
            Batch Value:{' '}
            <Text style={{ color: ui.tealDark, fontWeight: '900' }}>
              {money(totalBatchWorth)}
            </Text>
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change photo"
          onPress={() => setPhotoPickerVisible(true)}
          style={styles.changePhotoBadge}
        >
          <FishermanIcon name="sparkles" size={13} color={ui.tealDark} />
          <Text style={styles.changePhotoText}>Photo</Text>
        </Pressable>
      </View>

      {/* 03. ZERO QUANTITY RECOMMENDATION BANNER */}
      {isZeroQty ? (
        <View style={styles.zeroQtyBanner}>
          <View style={styles.zeroQtyIconWrap}>
            <FishermanIcon name="alert" size={18} color="#D97706" />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.zeroQtyTitle}>Quantity is 0 KG (Depleted)</Text>
            <Text style={styles.zeroQtySub}>
              Since available stock is zero, we recommend setting status to "Unavailable" to prevent customer ordering.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setStockStatus('Unavailable')}
            style={styles.setUnavailableBtn}
          >
            <Text style={styles.setUnavailableBtnText}>Set Unavailable</Text>
          </Pressable>
        </View>
      ) : null}

      {/* 01. PREFILLED FISH TYPE & SPECIES SELECTOR */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>01 · Fish Type & Species</Text>

        <Text style={styles.inputLabel}>
          Fish Species / Name <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (val.trim()) setNameError('');
          }}
          placeholder="e.g. Yellowfin Tuna (කෙළවල්ලා)"
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, nameError ? styles.inputError : null]}
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

        {/* QUICK SPECIES CHIPS */}
        <Text style={styles.subInputLabel}>Quick Species Presets (Tap to apply)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsScroll}
        >
          {SPECIES_PRESETS.map((item) => {
            const isMatch = name.includes(item.name.split(' ')[0]);
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => handleSelectPreset(item)}
                style={[styles.presetChip, isMatch && styles.presetChipActive]}
              >
                <Image source={item.img} style={styles.presetChipImg} resizeMode="cover" />
                <Text style={[styles.presetChipText, isMatch && styles.presetChipTextActive]}>
                  {item.name.split(' (')[0]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* SEAFOOD CATEGORY */}
        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Seafood Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORY_OPTIONS.map((cat) => {
            const isSelected = category === cat;
            return (
              <Pressable
                key={cat}
                accessibilityRole="button"
                onPress={() => setCategory(cat)}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 01. QUANTITY & UNIT PRICE (WITH REAL-TIME METRICS) */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>02 · Pricing & Stock Quantity</Text>

        <View style={styles.rowInputs}>
          {/* PRICE PER KG */}
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>
              Unit Price / Kg (Rs.) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.currencyInputWrap}>
              <Text style={styles.currencyPrefix}>Rs.</Text>
              <TextInput
                value={pricePerKg}
                onChangeText={(val) => {
                  setPricePerKg(val);
                  if (parseFloat(val) > 0) setPriceError('');
                }}
                keyboardType="numeric"
                placeholder="4200"
                placeholderTextColor={ui.mutedLight}
                style={[styles.input, styles.currencyInput, priceError ? styles.inputError : null]}
              />
            </View>
            {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}
          </View>

          {/* AVAILABLE QUANTITY */}
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>
              Quantity (kg) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.currencyInputWrap}>
              <TextInput
                value={availableKg}
                onChangeText={(val) => {
                  setAvailableKg(val);
                  if (parseFloat(val) >= 0) setQtyError('');
                }}
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor={ui.mutedLight}
                style={[styles.input, qtyError ? styles.inputError : null]}
              />
              <Text style={styles.unitSuffix}>KG</Text>
            </View>
            {qtyError ? <Text style={styles.errorText}>{qtyError}</Text> : null}
          </View>
        </View>

        {/* QUICK QUANTITY INCREMENTS */}
        <Text style={styles.subInputLabel}>Quick Quantity Adjustments</Text>
        <View style={styles.qtyChipsRow}>
          <Pressable onPress={() => handleAdjustWeight(-5)} style={styles.qtyChip}>
            <Text style={styles.qtyChipText}>- 5 kg</Text>
          </Pressable>
          <Pressable onPress={() => handleAdjustWeight(5)} style={styles.qtyChip}>
            <Text style={styles.qtyChipText}>+ 5 kg</Text>
          </Pressable>
          <Pressable onPress={() => handleAdjustWeight(10)} style={styles.qtyChip}>
            <Text style={styles.qtyChipText}>+ 10 kg</Text>
          </Pressable>
          <Pressable onPress={() => handleAdjustWeight(25)} style={styles.qtyChip}>
            <Text style={styles.qtyChipText}>+ 25 kg</Text>
          </Pressable>
          <Pressable onPress={() => handleAdjustWeight(50)} style={styles.qtyChip}>
            <Text style={styles.qtyChipText}>+ 50 kg</Text>
          </Pressable>
        </View>

        {/* 01. AVAILABILITY TOGGLE (PROMINENT STATUS SELECTOR) */}
        <Text style={[styles.inputLabel, { marginTop: 16 }]}>
          Availability Status <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.statusOptionsRow}>
          {STATUS_OPTIONS.map((status) => {
            const active = stockStatus === status;
            return (
              <Pressable
                key={status}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setStockStatus(status)}
                style={[
                  styles.statusOptionChip,
                  active && styles.statusOptionChipActive,
                  status === 'Unavailable' && active && styles.statusOptionChipUnavailable,
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
                    styles.statusOptionText,
                    active && styles.statusOptionTextActive,
                    status === 'Unavailable' && active && { color: '#DC2626' },
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* BATCH WORTH PREVIEW */}
        <View style={styles.summaryBar}>
          <Text style={styles.summaryLabel}>ESTIMATED BATCH STOCK VALUE</Text>
          <Text style={styles.summaryAmount}>{money(totalBatchWorth)}</Text>
        </View>
      </View>

      {/* 01. EXISTING / NEW PHOTOS PICKER */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardHeading}>03 · Existing & New Photos</Text>
            <Text style={styles.cardSubHeading}>
              Active display photo for marketplace buyer catalog
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPhotoPickerVisible(true)}
            style={styles.pickPhotoBtn}
          >
            <FishermanIcon name="sparkles" size={13} color={ui.tealDark} />
            <Text style={styles.pickPhotoBtnText}>Choose Photo</Text>
          </Pressable>
        </View>

        {/* SELECTED PHOTO PREVIEW */}
        <View style={styles.photoPreviewCard}>
          <Image source={selectedPhoto} style={styles.photoPreviewImg} resizeMode="cover" />
          <View style={styles.photoBadgeRow}>
            <View style={styles.photoCurrentBadge}>
              <FishermanIcon name="check" size={12} color="#FFFFFF" />
              <Text style={styles.photoCurrentBadgeText}>Active Display Photo</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setPhotoPickerVisible(true)}
              style={styles.replacePhotoPill}
            >
              <Text style={styles.replacePhotoPillText}>Replace Photo ↻</Text>
            </Pressable>
          </View>
        </View>

        {/* QUICK THUMBNAILS ROW */}
        <Text style={styles.subInputLabel}>Select from Catch Photo Presets</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsRow}
        >
          {PHOTO_PRESETS.map((p) => {
            const isSelected = selectedPhoto === p.source;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                onPress={() => setSelectedPhoto(p.source)}
                style={[
                  styles.thumbnailItem,
                  isSelected && styles.thumbnailItemActive,
                ]}
              >
                <Image source={p.source} style={styles.thumbnailImg} resizeMode="cover" />
                {isSelected ? (
                  <View style={styles.thumbnailCheckMark}>
                    <FishermanIcon name="check" size={10} color="#FFFFFF" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* FRESHNESS & PREPARATION NOTES */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>04 · Freshness & Description</Text>

        <Text style={styles.inputLabel}>Freshness Tagline</Text>
        <TextInput
          value={freshness}
          onChangeText={setFreshness}
          placeholder="e.g. Landed 1 hr ago at Negombo Pier"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Preparation Options / Cuts Summary</Text>
        <TextInput
          value={shortDesc}
          onChangeText={setShortDesc}
          placeholder="e.g. Cleaned & Gutted · Steak Cuts · Chilled on ice"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Customer Description & Storage Notes</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          placeholder="Detailed notes regarding boat catch, cold storage & handling..."
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, styles.textArea]}
        />
      </View>

      {/* 02. BUTTONS & NAVIGATION / CLICK ACTIONS BAR */}
      <View style={styles.actionsBar}>
        {/* SAVE CHANGES -> S05 / S07 */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save Changes to Listing (S08)"
          onPress={handleSave}
          style={styles.saveBtn}
        >
          <FishermanIcon name="check" size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Changes (S08)</Text>
        </Pressable>

        {/* CANCEL -> S07 */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel and return to Catch Details"
          onPress={handleCancel}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      </View>

      {/* PHOTO PRESETS SELECTION MODAL */}
      <Modal
        visible={photoPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Choose Catch Photo</Text>
                <Text style={styles.modalSub}>
                  Select high-quality seafood photo for your storefront listing
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPhotoPickerVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalGrid}>
                {PHOTO_PRESETS.map((p) => {
                  const isSelected = selectedPhoto === p.source;
                  return (
                    <Pressable
                      key={p.id}
                      accessibilityRole="button"
                      onPress={() => {
                        setSelectedPhoto(p.source);
                        setPhotoPickerVisible(false);
                      }}
                      style={[
                        styles.modalGridItem,
                        isSelected && styles.modalGridItemActive,
                      ]}
                    >
                      <Image source={p.source} style={styles.modalGridImg} resizeMode="cover" />
                      <View style={styles.modalGridLabelWrap}>
                        <Text numberOfLines={1} style={styles.modalGridLabel}>
                          {p.label}
                        </Text>
                        {isSelected ? (
                          <View style={styles.modalSelectedBadge}>
                            <FishermanIcon name="check" size={10} color="#FFFFFF" />
                          </View>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
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
  notFoundCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
    marginTop: 20,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 6,
  },
  notFoundSub: {
    fontSize: 13,
    color: ui.muted,
    textAlign: 'center',
    marginBottom: 18,
  },
  notFoundBtn: {
    backgroundColor: ui.tealDark,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  notFoundBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  // HEADER CARD
  headerCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerImg: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#EBF4F6',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
  },
  headerCategory: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  batchValueText: {
    fontSize: 11,
    color: ui.navy,
    marginTop: 4,
  },
  changePhotoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ui.tealLight,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },
  changePhotoText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },

  // 03. ZERO QTY BANNER
  zeroQtyBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  zeroQtyIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zeroQtyTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#92400E',
  },
  zeroQtySub: {
    fontSize: 10,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 14,
  },
  setUnavailableBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  setUnavailableBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  // CARDS & INPUTS
  card: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 14,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
    marginBottom: 12,
  },
  cardSubHeading: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    marginBottom: 6,
  },
  requiredStar: {
    color: ui.danger,
    fontWeight: '900',
  },
  subInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 6,
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
  textArea: {
    minHeight: 75,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyInputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  currencyPrefix: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: ui.tealDark,
  },
  currencyInput: {
    paddingLeft: 38,
  },
  unitSuffix: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: ui.muted,
  },

  // SPECIES PRESETS
  presetsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FA',
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4EEF2',
  },
  presetChipActive: {
    backgroundColor: ui.tealLight,
    borderColor: ui.tealDark,
  },
  presetChipImg: {
    width: 20,
    height: 20,
    borderRadius: 6,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  presetChipTextActive: {
    color: ui.tealDark,
  },

  // CATEGORY OPTIONS
  categoryScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FCFD',
    borderWidth: 1,
    borderColor: ui.border,
  },
  categoryChipSelected: {
    backgroundColor: ui.tealDark,
    borderColor: ui.tealDark,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.muted,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },

  // QUANTITY CHIPS
  qtyChipsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  qtyChip: {
    backgroundColor: '#F0F9FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4EEF2',
  },
  qtyChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },

  // AVAILABILITY STATUS OPTIONS
  statusOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statusOptionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F8FCFD',
    borderWidth: 1.5,
    borderColor: ui.border,
  },
  statusOptionChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  statusOptionChipUnavailable: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotReady: {
    backgroundColor: '#059669',
  },
  dotLimited: {
    backgroundColor: '#D97706',
  },
  dotUnavailable: {
    backgroundColor: '#DC2626',
  },
  statusOptionText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.muted,
  },
  statusOptionTextActive: {
    color: '#065F46',
  },

  // SUMMARY BAR
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EBF7F9',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#CCEBF0',
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 1,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
  },

  // PHOTOS SECTION
  pickPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ui.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pickPhotoBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  photoPreviewCard: {
    position: 'relative',
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#EBF4F6',
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 10,
  },
  photoPreviewImg: {
    width: '100%',
    height: '100%',
  },
  photoBadgeRow: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoCurrentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(6, 63, 80, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  photoCurrentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  replacePhotoPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  replacePhotoPillText: {
    color: ui.navy,
    fontSize: 10,
    fontWeight: '800',
  },
  thumbnailsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  thumbnailItem: {
    position: 'relative',
    width: 60,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#EBF4F6',
  },
  thumbnailItemActive: {
    borderColor: '#16D5D7',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  thumbnailCheckMark: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 02. ACTIONS BAR
  actionsBar: {
    gap: 10,
    marginTop: 4,
    marginBottom: 24,
  },
  saveBtn: {
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
  saveBtnText: {
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

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 28, 36, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: ui.navy,
  },
  modalSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  modalScroll: {
    paddingBottom: 24,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modalGridItem: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: ui.border,
    backgroundColor: '#F8FCFD',
  },
  modalGridItemActive: {
    borderColor: '#16D5D7',
  },
  modalGridImg: {
    width: '100%',
    height: 95,
  },
  modalGridLabelWrap: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalGridLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    flex: 1,
  },
  modalSelectedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
